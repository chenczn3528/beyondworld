# -*- coding: utf-8 -*-
"""
世界之外WIKI 侧影卡片抓取
- 合规 UA、Session+Retry、礼貌限速
- 仅保存图片/视频链接，不下载文件
- 模板解析更鲁棒；字段清洗
"""

import json
import time
import random
import re
from typing import Dict, List

import requests
import mwclient
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from pypinyin import Style, pinyin

# -----------------------------
# 基本配置
# -----------------------------
BASE_URL = "https://wiki.biligame.com"
WIKI_PATH = "/world/"
LIST_URL = f"{BASE_URL}{WIKI_PATH}%E4%BE%A7%E5%BD%B1%E5%9B%BE%E9%89%B4"

UA = "GachaLabCrawler/1.0 (+mailto:chenczn3528@gmail.com)"
HEADERS = {"User-Agent": UA}

# 输出
CARDS_JSON_PATH = "src/assets/cards.json"
POOL_CATEGORIES_PATH = "src/assets/poolCategories.json"
PINYIN_MAP_PATH = "src/assets/pinyin_map.json"

# -----------------------------
# 会话 & 礼貌访问
# -----------------------------
session = requests.Session()
retries = Retry(
    total=5,
    backoff_factor=1.4,
    status_forcelist=[429, 500, 502, 503, 504],
    allowed_methods=["GET"],
    raise_on_status=False,
)
session.mount("https://", HTTPAdapter(max_retries=retries))
session.headers.update(HEADERS)

def polite_get(url: str, timeout: int = 20) -> requests.Response:
    time.sleep(1.5 + random.random())  # 1.5~2.5s
    resp = session.get(url, timeout=timeout)
    resp.raise_for_status()
    if not resp.encoding:
        resp.encoding = resp.apparent_encoding or "utf-8"
    return resp

# -----------------------------
# 工具函数
# -----------------------------
def parse_best_from_srcset(srcset: str) -> str:
    """优先返回 2x，没有则取最后一项。"""
    if not srcset:
        return ""
    parts = [p.strip() for p in srcset.split(",") if p.strip()]
    if not parts:
        return ""
    for part in reversed(parts):
        if part.endswith(" 2x") or part.endswith("2x"):
            return part.rsplit(" ", 1)[0]
    return parts[-1].rsplit(" ", 1)[0] if " " in parts[-1] else parts[-1]

def clean_kv(line: str):
    """清洗模板行，返回 (key, value)；不合规返回(None, None)"""
    if "=" not in line:
        return None, None
    k, v = line.split("=", 1)
    k = k.replace("|", "").strip()
    v = v.strip()
    if not k:
        return None, None
    return k, v

def sanitize_event_html(html: str) -> str:
    """移除除 <br> 以外的标签，仅保留文本与 <br>。"""
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup.find_all(True):
        if tag.name == "br":
            tag.attrs = {}
            continue
        tag.unwrap()
    return soup.decode_contents().strip()

# -----------------------------
# mwclient 初始化
# -----------------------------
site = mwclient.Site(host="wiki.biligame.com", path=WIKI_PATH, clients_useragent=UA)

# -----------------------------
# 解析详情页的图片信息（仅链接）
# -----------------------------
def extract_image_info_from_detail(detail_url: str) -> List[Dict[str, str]]:
    """从详情页提取前几个纯图片tab的 src / srcset 链接"""
    image_info = []
    max_retries = 5
    for attempt in range(max_retries):
        try:
            detail_resp = polite_get(detail_url, timeout=30)
            soup = BeautifulSoup(detail_resp.text, "html.parser")

            resp_tabs = soup.select(".resp-tabs-container .resp-tab-content")

            def is_pure_img_tab(tab):
                element_children = [c for c in tab.children if getattr(c, "name", None)]
                return len(element_children) == 1 and element_children[0].name == "img"

            pure_tabs = [t for t in resp_tabs if is_pure_img_tab(t)]
            for tab in pure_tabs:
                img = tab.find("img")
                if not img:
                    continue
                src = img.get("src") or ""
                srcset = img.get("srcset") or ""
                src_1x = parse_best_from_srcset(srcset) or src
                # 尽量保留两档
                parts = [p.strip() for p in (srcset or "").split(",") if p.strip()]
                src_2x = ""
                for part in reversed(parts):
                    if part.endswith(" 2x") or part.endswith("2x"):
                        src_2x = part.rsplit(" ", 1)[0]
                        break
                image_info.append({
                    "src": src,
                    "srcset": src_1x,
                    "srcset2": src_2x
                })
            break
        except Exception as e:
            print(f"抓取详情页失败：{detail_url} -> {e}", flush=True)
            if attempt < max_retries - 1:
                time.sleep(2)
            else:
                print(f"已达最大重试次数，跳过：{detail_url}", flush=True)
    return image_info

# -----------------------------
# 图片数量校验
# -----------------------------
def is_valid_image_list(rarity: str, image_info: List[Dict[str, str]]) -> bool:
    if not image_info:
        return False
    # 过滤无效项（空 dict 或无 src）
    cleaned = [img for img in image_info if isinstance(img, dict) and img.get("src")]
    if not cleaned:
        return False
    count = len(cleaned)

    # 星/辰星：1张
    if rarity in ("星", "辰星"):
        return count == 1
    # 月：至少2张
    if rarity == "月":
        return count >= 2
    # 瞬：5张
    if rarity == "瞬":
        return count == 5
    # 世界/刹那：至少2张
    if rarity in ("世界", "刹那"):
        return count >= 2

    # 其他未知稀有度：只要有图即可
    return count > 0

# -----------------------------
# 用 wiki API 获取其他详细信息
# -----------------------------
def wiki_detailed_info(card_name: str) -> Dict[str, str]:
    """
    从页面文本中解析 {{侧影 ...}} 模板相关字段
    - 兼容键映射
    - 安全分段（缺段不报错）
    """
    info: Dict[str, any] = {}
    try:
        page = site.pages[card_name]
        raw = page.text() or ""
    except Exception as e:
        print(f"[mwclient] 读取失败：{card_name} -> {e}", flush=True)
        return info

    # 以 '{{侧影' 切割，可能得到 [前置, 基础字段段, 相会事件段, ...]
    parts = raw.split("{{侧影")
    if len(parts) < 2:
        return info

    # 字段名映射
    dict_map = {
        "名称": "卡名",
        "角色": "主角",
        "限定": "板块",
        "世界分类": "世界",
        "获取途径": "来源",
        "来源": "获取途径",
        "主属性": "属性",
    }

    # 基础字段段
    base_block = parts[1]
    for line in base_block.split("\n"):
        k, v = clean_kv(line)
        if not k:
            continue
        if k in dict_map:
            k = dict_map[k]
        info[k] = v

    # “相会事件”段（如果存在）
    meets: List[Dict[str, str]] = []
    # 可能 parts[2] 才是相会事件，也可能更多段，这里保险枚举后续段
    for blk in parts[2:]:
        # 多行值处理：抓取 |相会事件...= 到下一条字段或段结束
        for match in re.finditer(r"\|(?P<key>相会事件[^=]*)=(?P<val>.*?)(?=\n\||\n}}|$)", blk, re.S):
            key = match.group("key").strip()
            val = sanitize_event_html(match.group("val"))
            if val:
                meets.append({"title_img": key, "content_html": val})

        for line in blk.split("\n"):
            k, v = clean_kv(line)
            if not k:
                continue
            # 跳过“稀有度”这类非事件字段
            if "稀有度" in k:
                continue
            if "相会事件" in k:
                # 已由多行解析处理
                continue
            else:
                # 其他键值也记录
                info[k] = v
    if meets:
        info["相会事件"] = meets

    return info

# -----------------------------
# 规范化数据
# -----------------------------
def check_cards(card: Dict[str, any]) -> Dict[str, any]:
    """业务上的小修正"""
    if card.get("获取途径") == "【群星启明时】世界之间":
        card["获取途径"] = "世界之间"
    return card

def extract_recharge_cards(cards: List[Dict[str, any]]) -> List[Dict[str, str]]:
    """生成累充卡池信息"""
    recharge_cards: List[Dict[str, str]] = []

    for card in cards:
        source = card.get("来源") or ""
        pool_name = card.get("获取途径") or ""
        if "累充" not in source and "累充" not in pool_name:
            continue
        recharge_cards.append({
            "name": card.get("卡名", ""),
            "pool": pool_name or source,
            "rarity": card.get("稀有度", "")
        })

    def sort_key(entry: Dict[str, str]):
        pool = entry.get("pool", "")
        match = re.search(r"\d+", pool)
        number = int(match.group()) if match else 0
        return (number, pool, entry.get("name", ""))

    recharge_cards.sort(key=sort_key)
    return recharge_cards

def build_pinyin_entry(text: str) -> Dict[str, any]:
    """为给定文本生成拼音信息，非中文字符对应空串。"""
    syllables: List[str] = []
    for char in text:
        if re.match(r"[\u4e00-\u9fff]", char):
            result = pinyin(char, style=Style.NORMAL, heteronym=False, errors="ignore")
            syllable = result[0][0] if result and result[0] else ""
            syllables.append(syllable.lower())
        else:
            syllables.append("")
    full = "".join([s for s in syllables if s])
    initials = "".join([s[0] for s in syllables if s])
    return {"full": full, "initials": initials, "syllables": syllables}

def sync_pinyin_map(cards: List[Dict[str, any]]) -> bool:
    """补齐 pinyin_map.json 中缺失的卡名拼音，返回是否发生变更。"""
    try:
        with open(PINYIN_MAP_PATH, "r", encoding="utf-8") as f:
            pinyin_map = json.load(f)
    except FileNotFoundError:
        pinyin_map = {}

    added = []
    for card in cards:
        name = card.get("卡名")
        if not name or name in pinyin_map:
            continue
        pinyin_map[name] = build_pinyin_entry(name)
        added.append(name)

    if added:
        with open(PINYIN_MAP_PATH, "w", encoding="utf-8") as f:
            json.dump(pinyin_map, f, ensure_ascii=False, indent=2)
        print(f"已补充拼音映射 {len(added)} 条：{', '.join(added)}", flush=True)
        return True

    print("拼音映射无需更新。", flush=True)
    return False

def sync_recharge_section(pool_categories: Dict[str, any], recharge_cards: List[Dict[str, str]]) -> bool:
    """将累充卡池写入 poolCategories.json，返回是否发生变更"""
    if "recharge" not in pool_categories:
        pool_categories["recharge"] = {
            "name": "累充卡池",
            "icon": "💎",
            "cards": []
        }
        changed = True
    else:
        changed = False

    recharge_section = pool_categories["recharge"]
    if "name" not in recharge_section:
        recharge_section["name"] = "累充卡池"
        changed = True
    if "icon" not in recharge_section:
        recharge_section["icon"] = "💎"
        changed = True

    existing_cards = recharge_section.get("cards", [])
    if existing_cards != recharge_cards:
        recharge_section["cards"] = recharge_cards
        changed = True

    return changed

# -----------------------------
# 主流程：列表页 -> 每项详情 -> 组装输出
# -----------------------------
def main():
    print("🚀 开始抓取：", LIST_URL)
    cards: List[Dict[str, any]] = []

    resp = polite_get(LIST_URL)
    soup = BeautifulSoup(resp.text, "html.parser")
    rows = soup.find_all("tr")
    valid_rows: List[tuple] = []

    for row in rows:
        if not row.has_attr("data-param1"):
            continue

        name_div = row.find("div", class_="cardname")
        if not name_div:
            continue
        card_name = name_div.get_text(strip=True).split("·")[-1]
        valid_rows.append((row, card_name))

    print(f"🃏 本次共需抓取 {len(valid_rows)} 张卡片。", flush=True)

    for index, (row, card_name) in enumerate(valid_rows):

        info_dict = wiki_detailed_info(card_name)

        link_tag = row.find("a", href=True)
        if link_tag:
            detail_url = urljoin(BASE_URL, link_tag["href"])
            print(f"[{index}] 抓取：{card_name} -> {detail_url}", flush=True)

            rarity = info_dict.get("稀有度", "")
            image_info = []
            max_img_retries = 3
            for attempt in range(1, max_img_retries + 1):
                image_info = extract_image_info_from_detail(detail_url)
                if is_valid_image_list(rarity, image_info):
                    break
                wait = 1.5 + attempt * 0.8
                print(f"[重试] 图片数量不符合（{rarity}）：{card_name} -> 第{attempt}次，等待{wait:.1f}s", flush=True)
                time.sleep(wait)

            if image_info and is_valid_image_list(rarity, image_info):
                info_dict["图片信息"] = image_info
            else:
                print(f"[跳过] 图片数量仍不符合（{rarity}）：{card_name}", flush=True)
                continue
        else:
            print(f"[跳过] 缺少详情链接：{card_name}", flush=True)
            continue

        info_dict = check_cards(info_dict)

        cards.append(info_dict)

    # ------------ 卡池分类更新 ------------
    try:
        with open(POOL_CATEGORIES_PATH, "r", encoding="utf-8") as f:
            pool_categories = json.load(f)
    except FileNotFoundError:
        pool_categories = {}

    existing_pools = set()
    limited_filtered = False

    world_between = pool_categories.get("worldBetween", {})
    subcategories = world_between.get("subcategories", {})
    excluded_limited_pools = {"世界之间", "崩坍之界商店"}
    for key, category in subcategories.items():
        pools = category.get("pools", [])
        if key == "limited":
            filtered_pools = [
                p for p in pools
                if "累充" not in p and p not in excluded_limited_pools
            ]
            if len(filtered_pools) != len(pools):
                category["pools"] = filtered_pools
                pools = filtered_pools
                limited_filtered = True
        for pool_name in pools:
            if key == "limited" and "累充" in pool_name:
                continue
            existing_pools.add(pool_name)

    for key, value in pool_categories.items():
        if key == "worldBetween":
            continue
        pools = value.get("pools")
        if isinstance(pools, list):
            for pool_name in pools:
                existing_pools.add(pool_name)

    new_pool_candidates = {}
    for card in cards:
        pool_name = card.get("获取途径")
        if not pool_name:
            continue
        if "累充" in pool_name:
            continue
        if pool_name in excluded_limited_pools:
            continue
        if pool_name in existing_pools:
            continue
        if pool_name not in new_pool_candidates:
            new_pool_candidates[pool_name] = card

    newly_added_pools = []

    if new_pool_candidates:
        world_between = pool_categories.setdefault("worldBetween", {
            "name": "世界之间系列",
            "icon": "🌟",
            "subcategories": {}
        })
        subcategories = world_between.setdefault("subcategories", {})

        collapsed_category = subcategories.setdefault("collapsed", {
            "name": "崩坍系列",
            "pools": []
        })
        birthday_category = subcategories.setdefault("birthday", {
            "name": "生日系列",
            "pools": []
        })
        limited_category = subcategories.setdefault("limited", {
            "name": "限定",
            "pools": []
        })

        collapsed_pools = collapsed_category.setdefault("pools", [])
        birthday_pools = birthday_category.setdefault("pools", [])
        limited_pools = limited_category.setdefault("pools", [])

        for pool_name, card in new_pool_candidates.items():
            target_list = None
            if card.get("所属世界") == "崩坍之界":
                target_list = collapsed_pools
            elif card.get("板块") == "特别纪念":
                target_list = birthday_pools
            else:
                if "活动" in pool_name or "奇遇" in pool_name:
                    continue
                target_list = limited_pools

            if target_list is not None and pool_name not in target_list:
                target_list.insert(0, pool_name)
                newly_added_pools.append(pool_name)
                existing_pools.add(pool_name)

    recharge_cards = extract_recharge_cards(cards)
    recharge_updated = sync_recharge_section(pool_categories, recharge_cards)

    if newly_added_pools or recharge_updated or limited_filtered:
        with open(POOL_CATEGORIES_PATH, "w", encoding="utf-8") as f:
            json.dump(pool_categories, f, ensure_ascii=False, indent=2)
        messages = []
        if newly_added_pools:
            messages.append(f"检测到新的卡池并已更新: {', '.join(newly_added_pools)}")
        if recharge_updated:
            messages.append("累充卡池信息已同步")
        if limited_filtered:
            messages.append("限定卡池已过滤累充奖励")
        print("；".join(messages), flush=True)
    else:
        print("未检测到新的卡池，累充卡池与限定卡池均无变化。", flush=True)

    # ------------ 保存卡片数据 ------------
    with open(CARDS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(cards, f, ensure_ascii=False, indent=2)
    print(f"✅ 共抓取 {len(cards)} 张卡片信息并保存完成。", flush=True)

    # ------------ 补齐拼音映射 ------------
    sync_pinyin_map(cards)

if __name__ == "__main__":
    main()
