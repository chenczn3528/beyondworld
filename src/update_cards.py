import mwclient
import requests
from bs4 import BeautifulSoup
import json
import time

baseurl = "https://wiki.biligame.com"
url = "https://wiki.biligame.com/world/%E4%BE%A7%E5%BD%B1%E5%9B%BE%E9%89%B4"
headers = {
    'User-Agent': 'Mozilla/5.0'
}
response = requests.get(url, headers=headers)
response.encoding = 'utf-8'

soup = BeautifulSoup(response.text, 'html.parser')

rows = soup.find_all('tr')
cards = []

# 连接到 BWIKI
site = mwclient.Site('wiki.biligame.com', path='/world/')

# 用wiki API获取其他详细信息
def wiki_detailed_info(card_name):

    # 指定页面名
    page = site.pages[card_name]  # 页面标题不需要编码（会自动处理）

    # 获取文本内容
    text = page.text().split("{{侧影")

    info_dict = {}

    dict_map = {
        "名称": "卡名",
        "角色": "主角",
        "限定": "板块",
        "世界分类": "世界",
        "获取途径": "来源",
        "来源": "获取途径",
        "主属性": "属性",
    }

    for line in text[1].split("\n"):
        if "|" in line:
            key = line.replace("|", "").split("=")[0]
            if key in dict_map.keys():
                key = dict_map[key]
            value = line.replace("|", "").split("=")[1]
            info_dict[key] = value
            # if "群星启明时" in value:
            #     print(text[0])
            #     s = input()


    meets = []
    for line in text[2].split("\n"):
        if "|" in line:
            if "稀有度" in line.split("=")[0]:
                continue
            elif "相会事件" in line.split("=")[0]:
                key = line.replace("|", "").split("=")[0]
                value = line.replace("|", "").split("=")[1]
                if value:
                    meets.append({"title_img": key, "content_html": value})
            else:
                key = line.replace("|", "").split("=")[0]
                value = line.replace("|", "").split("=")[1]
                info_dict[key] = value
    info_dict["相会事件"] = meets

    return info_dict

def check_cards(card):
    if card['获取途径'] == "【群星启明时】世界之间":
        card['获取途径'] = "世界之间"
    return card


for index, row in enumerate(rows):
    if not row.has_attr('data-param1'):
        continue

    name_div = row.find('div', class_='cardname')
    card_name = name_div.get_text(strip=True).split("·")[-1]

    info_dict = wiki_detailed_info(card_name)

    link_tag = row.find('a', href=True)
    if link_tag:
        detail_url = baseurl + link_tag['href']

        # 尝试访问详情页，抓取“相会事件”和图像链接，最多重试5次
        max_retries = 5
        for attempt in range(max_retries):
            try:
                print(f"[{index}] 正在抓取：{card_name} 的详情页内容（尝试第 {attempt+1} 次）", flush=True)
                detail_resp = requests.get(detail_url, headers=headers, timeout=30)
                detail_resp.encoding = 'utf-8'
                detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

                # 提取前两个resp-tab-content里的src和srcset
                image_info = []
                resp_tabs = detail_soup.select('.resp-tabs-container .resp-tab-content')
                for i, tab in enumerate(resp_tabs[:3]):  # 只取前3个
                    img_tag = tab.find('img')
                    if img_tag:
                        src = img_tag.get('src')
                        srcset = img_tag.get('srcset', '')
                        srcset_parts = srcset.split(', ')
                        srcset15 = srcset_parts[0].split(" ")[0] if len(srcset_parts) > 0 else ''
                        srcset2 = srcset_parts[1].split(" ")[0] if len(srcset_parts) > 1 else ''
                        image_info.append({
                            'src': src,
                            'srcset': srcset15,
                            'srcset2': srcset2
                        })
                if image_info:
                    info_dict['图片信息'] = image_info

                break  # 成功抓取，退出重试循环

            except Exception as e:
                print(f"抓取失败：{card_name} -> {e}", flush=True)
                if attempt < max_retries - 1:
                    time.sleep(2)  # 等待再重试
                else:
                    print(f"已达最大重试次数，跳过：{card_name}", flush=True)
                    print(wiki_detailed_info(card_name), flush=True)
                    print(info_dict, flush=True)

        # 避免请求过快
        time.sleep(1.5)

    info_dict = check_cards(info_dict)

    cards.append(info_dict)





# 卡池分类文件路径
pool_categories_path = 'src/assets/poolCategories.json'

# 检查是否有新的卡池并更新配置
try:
    with open(pool_categories_path, 'r', encoding='utf-8') as f:
        pool_categories = json.load(f)
except FileNotFoundError:
    pool_categories = {}

existing_pools = set()

world_between = pool_categories.get('worldBetween', {})
subcategories = world_between.get('subcategories', {})
for category in subcategories.values():
    for pool_name in category.get('pools', []):
        existing_pools.add(pool_name)

for key, value in pool_categories.items():
    if key == 'worldBetween':
        continue
    pools = value.get('pools')
    if isinstance(pools, list):
        for pool_name in pools:
            existing_pools.add(pool_name)

new_pool_candidates = {}
for card in cards:
    pool_name = card.get('获取途径')
    if not pool_name:
        continue
    if pool_name in existing_pools:
        continue
    if pool_name not in new_pool_candidates:
        new_pool_candidates[pool_name] = card

newly_added_pools = []

if new_pool_candidates:
    world_between = pool_categories.setdefault('worldBetween', {
        "name": "世界之间系列",
        "icon": "🌟",
        "subcategories": {}
    })
    subcategories = world_between.setdefault('subcategories', {})

    collapsed_category = subcategories.setdefault('collapsed', {
        "name": "崩坍系列",
        "pools": []
    })
    birthday_category = subcategories.setdefault('birthday', {
        "name": "生日系列",
        "pools": []
    })
    limited_category = subcategories.setdefault('limited', {
        "name": "限定",
        "pools": []
    })

    collapsed_pools = collapsed_category.setdefault('pools', [])
    birthday_pools = birthday_category.setdefault('pools', [])
    limited_pools = limited_category.setdefault('pools', [])

    for pool_name, card in new_pool_candidates.items():
        target_list = None

        if card.get('所属世界') == "崩坍之界":
            target_list = collapsed_pools
        elif card.get('板块') == "特别纪念":
            target_list = birthday_pools
        else:
            if "活动" in pool_name or "奇遇" in pool_name:
                continue
            target_list = limited_pools

        if target_list is not None and pool_name not in target_list:
            target_list.append(pool_name)
            newly_added_pools.append(pool_name)
            existing_pools.add(pool_name)

if newly_added_pools:
    with open(pool_categories_path, 'w', encoding='utf-8') as f:
        json.dump(pool_categories, f, ensure_ascii=False, indent=2)
    print(f"检测到新的卡池并已更新: {', '.join(newly_added_pools)}", flush=True)
else:
    print("未检测到新的卡池。", flush=True)

# 保存到文件
with open('src/assets/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"共抓取 {len(cards)} 张卡片信息并保存完成。", flush=True)
