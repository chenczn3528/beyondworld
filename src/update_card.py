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

for index, row in enumerate(rows):
    if not row.has_attr('data-param1'):
        continue

    card = {
        '主角': row.get('data-param1'),
        '稀有度': row.get('data-param2'),
        '板块': row.get('data-param3'),
        '世界': row.get('data-param4'),
        '来源': row.get('data-param5'),
        '类型': row.get('data-param6'),
        '属性': row.get('data-param7'),
        '思维': row.get('data-param8'),
        '魅力': row.get('data-param9'),
        '体魄': row.get('data-param10'),
        '感知': row.get('data-param11'),
        '灵巧': row.get('data-param12'),
    }

    # 找到包含“获取途径”的 <td>，一般是最后一个 <td>
    tds = row.find_all('td')

    if tds[-1] and "获取途径" in tds[-1].text:
        card['获取途径'] = tds[-1].text.split("获取途径：")[-1].replace("\n", "").replace("【群星启明时】","")

    name_div = row.find('div', class_='cardname')
    if name_div:
        card['卡名'] = name_div.get_text(strip=True).split("·")[-1]

    link_tag = row.find('a', href=True)
    if link_tag:
        detail_url = baseurl + link_tag['href']
        card['详情页'] = detail_url

        # 尝试访问详情页，抓取“相会事件”和图像链接
        try:
            print(f"[{index}] 正在抓取：{card['卡名']} 的详情页内容")
            detail_resp = requests.get(detail_url, headers=headers)
            detail_resp.encoding = 'utf-8'
            detail_soup = BeautifulSoup(detail_resp.text, 'html.parser')

            # 提取相会事件
            meets = []
            meet_count = 1
            for meet_div in detail_soup.select('div.meet'):
                content_div = meet_div.select_one('.m-contain')

                if content_div:
                    meet = {
                        "title_img": "相会事件" + str(meet_count),
                        "content_html": str(content_div).replace('<div class="m-contain">', '').replace('</div>', '').strip()
                    }
                    meets.append(meet)
                    meet_count += 1
            if meets:
                card['相会事件'] = meets

            # 提取前两个resp-tab-content里的src和srcset
            image_info = []
            resp_tabs = detail_soup.select('.resp-tabs-container .resp-tab-content')
            for i, tab in enumerate(resp_tabs[:2]):  # 只取前两个
                img_tag = tab.find('img')
                if img_tag:
                    src = img_tag.get('src')
                    srcset = img_tag.get('srcset')
                    srcset15 = srcset.split(', ')[0].split(" ")[0]
                    srcset2 = srcset.split(', ')[1].split(" ")[0]
                    image_info.append({
                        'src': src,
                        'srcset': srcset15,
                        'srcset2': srcset2
                    })
            if image_info:
                card['图片信息'] = image_info

        except Exception as e:
            print(f"抓取失败：{card['卡名']} -> {e}")

        # 避免请求过快
        time.sleep(1.5)

    cards.append(card)

# 保存到文件
with open('src/assets/cards.json', 'w', encoding='utf-8') as f:
    json.dump(cards, f, ensure_ascii=False, indent=2)

print(f"共抓取 {len(cards)} 张卡片信息并保存完成。")
