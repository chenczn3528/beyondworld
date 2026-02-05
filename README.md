# 世界之外抽卡模拟器 BeyondWorld

基于 React + Vite 打造的《世界之外》非官方抽卡演示项目，集成了抽卡动画、保底模拟、图鉴展示、音乐播放与素材缓存等功能，帮助玩家在网页端体验抽卡流程、查看卡面与活动池信息。全部卡面与文案数据来自 [世界之外 BWIKI](https://wiki.biligame.com/world/%E9%A6%96%E9%A1%B5)。


## 更新日志
- 2026-02-05：修复相会事件为空的报错
- 2026-01-28：修改音乐iframe，增加图鉴页面检索迷失国度；修改限定卡池排序
- 2026-01-17：修改音乐iframe
- 2026-01-16：增加概率模拟中各角色的出金数据
- 2026-01-15：增加图鉴筛选页面的卡池展开收起；增加自动更新时的拼音搜索数据
- 2026-01-13：修改图鉴筛选页面，增加卡池筛选及搜索；修改卡池、主角顺序
- 2026-01-09：歌曲爬虫更新，由bs4爬虫改为API请求（才知道有API）；修改歌曲选择的界面
- 2026-01-05：历史记录新增稀有度筛选、分段展示与总数提示；修改动画缓存页面的提示；测试--用户访问网站总是获取最新数据

## 功能亮点

- 抽卡体验：支持单抽 / 十连、大小保底、目标角色设定、跳过动画等核心机制。
- 卡池筛选：按世界、稀有度、板块、活动类型等维度筛选，内置「世界之间」「生日」「限定」等分类。
- 历史与统计：本地持久化抽卡记录、五星统计、平均出金等数据，一键清空即可重置。
- 图鉴与大图：内置卡面、重逢立绘浏览，可按角色、稀有度、世界等条件过滤。
- 音频与素材缓存：通过素材缓存页面一键缓存视频 / 音频 / 图片到 IndexedDB，离线环境仍能快速播放。
- 离线与性能：集成 Service Worker 与素材体积统计，适合在弱网或移动设备上体验。

## 快速开始

> 推荐使用 Node.js 18+

```bash
# 安装依赖
npm install

# 开发模式（默认 http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview
```

项目默认使用 Hash Router，`package.json` 中的 `homepage` 已设置为 `/beyondworld/`，可直接部署到 GitHub Pages 或任意静态托管平台。

## 目录结构

```
src/
├─ App.jsx / Home.jsx          # 主界面与抽卡流程
├─ components/                 # 抽卡动画、图鉴、设置面板、缓存工具等 UI 组件
├─ hooks/                      # 本地存储、IndexedDB 素材下载、历史记录 hook
├─ assets/                     # cards.json、poolCategories.json、assets_config 等数据
├─ utils/                      # 概率、卡池工具、音效工具
├─ scan_assets.py              # 扫描 public 素材并生成配置
├─ update_cards.py             # 从 BWIKI 抓取卡面 / 卡池数据
└─ service_worker.js           # PWA 缓存逻辑
```

## 数据与素材维护

### 更新卡片与卡池信息

`src/update_cards.py` 会访问 BWIKI 的「侧影图鉴」与卡面详情页，生成最新的 `cards.json` 与 `poolCategories.json`。

```bash
python3 -m venv .venv
source .venv/bin/activate        # Windows 使用 .venv\Scripts\activate
pip install -r requirements.txt
python src/update_cards.py
```

脚本依赖 `requests`, `beautifulsoup4`, `mwclient`（以及可选的 `selenium`, `chromedriver-autoinstaller` 用于后续扩展）。

### 维护素材缓存清单

1. 将视频、音频、图片放入 `public/videos`, `public/audios`, `public/images`, `public/signs` 等目录。
2. 运行 `python src/scan_assets.py` 自动生成 `src/assets/assets_config.json` 与 `assets_config.js`，记录文件路径、大小、统计信息。
3. 在应用中打开「动画素材缓存」（`AssetTest` 页面），点击「存储所有素材」，素材会被写入 IndexedDB 并支持断点续传。

## 常用界面

- **AssetTest**：应用首次打开即进入的素材缓存页，可在设置层再次打开；显示缓存进度、素材体积和调试信息。
- **设置层**：调节保底、卡池、音乐、图鉴过滤，查看更新日志与数据来源 / 版权说明。
- **图鉴与图库**：浏览所有卡面及重逢立绘，支持角色 / 世界 / 稀有度筛选与历史记录。
- **抽卡动画**：支持跳过、单抽 / 十连、出金动画、抽卡结果汇总以及抽卡历史回放。

## 开发提示

- 代码风格由 ESLint 管理，执行 `npm run lint` 可校验。
- `useLocalStorageState` 与 `useHistoryDB` 负责本地持久化，可在设置层使用「清空数据」按钮重置。
- 更改素材缓存逻辑时需同步更新 `src/hooks/useAssetStorage.js` 与 `AssetTest.jsx` 的展示字段。
- 构建后请在浏览器中验证 Service Worker 的缓存行为，确保离线模式下资源可用。

## 致谢与许可

- 卡面与文案来自 [世界之外 BWIKI](https://wiki.biligame.com/world/%E9%A6%96%E9%A1%B5)，由社区玩家自发维护。
- 素材使用遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 协议；图片、音频及相关素材版权归原游戏官方所有，本项目仅用于学习与非商业展示。
- 如有问题或建议，欢迎通过 Issue 与我们交流。🪐
