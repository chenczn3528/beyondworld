import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time

songs_json_path = "src/assets/songs.json"
songs_list_path = "src/assets/songs_list.json"

def create_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.binary_location = '/usr/bin/chromium-browser'
    service = Service('/usr/bin/chromedriver')
    return webdriver.Chrome(service=service, options=options)

def get_albums(driver, artist_id):
    artist_url = f"https://music.163.com/#/artist/album?id={artist_id}&limit=1000"

    # 获取浏览器版本
    browser_version = driver.capabilities['browserVersion']
    print("Chrome 浏览器版本:", browser_version)

    # 获取 chromedriver 版本（不一定所有版本都支持）
    chromedriver_version = driver.capabilities.get('chrome', {}).get('chromedriverVersion', '').split(' ')[0]
    print("chromedriver 版本:", chromedriver_version)


    driver.get(artist_url)

    time.sleep(3)   # 等待页面加载，确保 iframe 内容渲染完毕

    # 切换到 iframe
    driver.switch_to.frame("g_iframe")
    time.sleep(2)

    soup = BeautifulSoup(driver.page_source, "html.parser")

    albums = []

    for li in soup.select("ul#m-song-module li"):
        a_tag = li.select_one("a.msk")
        if not a_tag:
            continue
        href = a_tag.get("href", "")
        album_id = href.split("id=")[-1] if "id=" in href else None

        title = li.select_one("p.dec a.tit")
        if title:
            album_title = title.text.strip()
        else:
            album_title = li.select_one("div.u-cover")["title"] if li.select_one("div.u-cover") else "未知专辑"

        if album_id:
            albums.append((album_id, album_title))

    driver.switch_to.default_content()  # 记得切回默认内容，方便下次调用
    return albums

def get_songs(driver, album_id, album_title):
    album_url = f"https://music.163.com/#/album?id={album_id}&limit=1000"
    driver.get(album_url)

    time.sleep(3)  # 等待页面加载，确保 iframe 内容渲染完毕

    # 切换到 iframe
    driver.switch_to.frame("g_iframe")
    time.sleep(2)

    soup = BeautifulSoup(driver.page_source, "html.parser")

    songs = []

    table = soup.find('table', class_='m-table m-table-album')
    trs = table.tbody.find_all('tr')

    print(f"共找到{len(trs)}行歌曲数据，专辑：{album_title}")

    for tr in trs:
        song_id = tr.get('id')
        title_tag = tr.find('b')
        title = title_tag['title'] if title_tag and title_tag.has_attr('title') else None

        duration_tag = tr.find('td', class_='s-fc3')
        duration = duration_tag.find('span', class_='u-dur').text if duration_tag else None

        last_td = tr.find_all('td')[-1]
        singer_div = last_td.find('div', class_='text')
        singers = singer_div['title'] if singer_div and singer_div.has_attr('title') else None

        songs.append({
            "id": song_id,
            "title": title,
            "duration": duration,
            "singers": singers
        })

    driver.switch_to.default_content()
    return songs

if __name__ == "__main__":
    driver = create_driver()
    try:
        final_results = {}
        albums = get_albums(driver, "59888486")
        print(f"共找到 {len(albums)} 张专辑：")
        for album_id, album_title in albums:
            print(f"\n{album_id} : {album_title}")
            songs = get_songs(driver, album_id, album_title)
            final_results[album_id] = {
                "name": album_title,
                "songs": songs
            }

        with open(songs_json_path, "w", encoding="utf-8") as f:
            json.dump(final_results, f, ensure_ascii=False, indent=4)

        songs_list = []
        for key, value in final_results.items():
            for song in value["songs"]:
                songs_list.append(song)

        print(len(songs_list))
        for i in songs_list:
            print(i)

        with open(songs_list_path, "w", encoding="utf-8") as f:
            json.dump(songs_list, f, ensure_ascii=False, indent=4)

    finally:
        driver.quit()
