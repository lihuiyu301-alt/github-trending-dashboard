<div align="center">

# 🔥 GitHub Trending Dashboard

**实时发现 GitHub 上最火的开源项目**

一个现代化、响应式的 GitHub 热门项目看板，帮助开发者追踪技术趋势、发现优质开源项目。

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## ✨ 功能特性

- [x] 🔥 **热门项目浏览** — 基于 GitHub Search API，按 Star 数降序展示最火项目
- [x] **本周精选推荐** — 跟随语言筛选展示本周新晋热门、殿堂级热门、近期活跃热门
- [x] **每周邮件周报** — GitHub Actions 每周一自动汇总 8 种语言的热门项目并发送邮件
- [x] 🌐 **多语言筛选** — 支持 JavaScript、TypeScript、Python、Go、Rust、Java、C++、Swift 等 8 种语言
- [x] ⏰ **时间范围切换** — 按 Today / This Week / This Month 三个维度筛选
- [x] 🔍 **实时搜索** — 输入关键词搜索仓库，500ms 防抖优化
- [x] ⭐ **收藏功能** — 一键收藏喜欢的项目，localStorage 持久化存储
- [x] 🌙 **深色模式** — 支持 Light / Dark 主题切换，跟随系统偏好
- [x] 💀 **骨架屏加载** — 精确模拟卡片布局的 Shimmer 动效骨架屏
- [x] 🚦 **错误处理** — Rate Limit 提示、网络错误重试、空状态引导
- [x] 📱 **响应式布局** — 移动端 1 列 / 平板 2 列 / 桌面 3 列自适应
- [x] 🔗 **URL 同步** — 筛选状态同步到 URL，支持分享和刷新恢复
- [x] 📦 **分页加载** — Load More 按钮分页，支持无限扩展
- [x] 🛡️ **错误边界** — 全局 ErrorBoundary 捕获意外错误

## 📸 项目截图

<div align="center">

### Light Mode

![Light Mode](https://via.placeholder.com/800x450/f6f8fa/1f2328?text=Light+Mode+Screenshot)

### Dark Mode

![Dark Mode](https://via.placeholder.com/800x450/0d1117/e6edf3?text=Dark+Mode+Screenshot)

</div>

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/lihuiyu301-alt/github-trending-dashboard.git
cd github-trending-dashboard

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

浏览器访问 [http://localhost:5173](http://localhost:5173) 即可使用。

### 构建生产版本

```bash
npm run build       # 输出到 dist/
npm run preview     # 本地预览构建结果
```

## 🔑 GitHub Token 配置（可选）

GitHub API 对未认证用户限制 **60 次/小时**。如需更高配额（**5000 次/小时**），可配置 Personal Access Token：

```bash
# 在项目根目录创建 .env.local 文件
echo "VITE_GITHUB_TOKEN=ghp_你的Token" > .env.local
```

> 💡 Token 仅在浏览器端使用，不会上传到任何服务器。`.env.local` 已在 `.gitignore` 中排除。

## 邮件周报配置（可选）

邮件周报通过 GitHub Actions 定时运行，不需要自建服务器或数据库。

### 发送规则

- 时间：每周一 09:00（北京时间，UTC `0 1 * * 1`）
- 收件人：固定单个邮箱
- 内容：8 种语言，每种语言包含“本周新晋热门”“殿堂级热门”“近期活跃热门”三个榜单，各取前 5 名
- 数据源：GitHub Search API

### 配置 GitHub Secrets

在仓库 `Settings → Secrets and variables → Actions` 中添加：

| Secret | 说明 |
|---|---|
| `MAIL_HOST` | SMTP 服务器，如 `smtp.qq.com`、`smtp.163.com` |
| `MAIL_PORT` | SMTP 端口，通常为 `465` |
| `MAIL_SECURE` | 端口 465 时填 `true`，其他端口按服务商要求填写 |
| `MAIL_USER` | 发件邮箱地址 |
| `MAIL_PASS` | 邮箱授权码或应用专用密码，不是邮箱登录密码 |
| `MAIL_TO` | 收件邮箱地址 |
| `MAIL_FROM` | 发件人显示地址，可与 `MAIL_USER` 相同 |

以 QQ 邮箱为例：`MAIL_HOST=smtp.qq.com`、`MAIL_PORT=465`、`MAIL_SECURE=true`，`MAIL_PASS` 填写 QQ 邮箱设置中生成的授权码。

### 手动测试

在 GitHub 仓库的 `Actions → Weekly GitHub Digest → Run workflow` 中：

- `dry_run` 勾选：只生成 HTML 预览并上传 artifact，不发送邮件
- `dry_run` 不勾选：立即发送一封测试邮件

本地生成预览：

```bash
npm run digest:preview
```

生成结果位于项目根目录的 `digest-preview.html`。本地实际发送需要先配置 `MAIL_*` 环境变量，再运行：

```bash
npm run digest:send
```

> 定时任务只会在 GitHub 默认分支上生效，且 GitHub Actions 的 cron 触发可能有几分钟延迟。当前目录若尚未关联 Git 仓库，请先推送到 GitHub。

## 📁 项目结构

```
github-trending-dashboard/
├── public/                     # 静态资源
├── src/
│   ├── components/             # UI 组件
│   │   ├── Navbar.jsx          # 导航栏（Logo、搜索、主题切换）
│   │   ├── FilterBar.jsx       # 筛选栏（语言 + 时间范围）
│   │   ├── RecommendationBoard.jsx # 本周精选推荐区
│   │   ├── RepoCard.jsx        # 仓库卡片（React.memo 优化）
│   │   ├── RepoList.jsx        # 卡片网格容器
│   │   ├── SkeletonCard.jsx    # 骨架卡片
│   │   ├── SkeletonLoader.jsx  # 骨架屏加载器
│   │   ├── EmptyState.jsx      # 空状态 / 错误状态
│   │   ├── BookmarkList.jsx    # 收藏夹页面
│   │   └── ErrorBoundary.jsx   # 错误边界
│   ├── config/                 # 共享配置
│   │   └── languages.js        # 支持的语言列表
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useGithubSearch.js  # API 请求 + 缓存 + 竞态处理
│   │   ├── useRecommendations.js # 推荐榜单请求 + 缓存
│   │   ├── useBookmarks.js     # 收藏夹 localStorage 管理
│   │   ├── useTheme.js         # 主题切换 + 持久化
│   │   └── useTranslate.js     # 翻译功能（MyMemory API）
│   ├── utils/                  # 工具函数
│   │   ├── githubApi.js        # URL 构建、日期计算、数字格式化
│   │   ├── recommendations.js  # 推荐榜单查询与请求
│   │   └── languageColors.js   # GitHub 官方语言颜色映射
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式 + Tailwind 配置
├── scripts/
│   └── weekly-digest.mjs       # 邮件周报生成与发送脚本
├── .github/workflows/
│   ├── ci.yml                  # 持续集成
│   └── weekly-digest.yml       # 每周邮件周报
├── vite.config.js              # Vite 配置
├── package.json
└── README.md
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 构建工具 | Vite | 8.x | 极速 HMR，ESM 原生支持 |
| 前端框架 | React | 19.x | Concurrent Mode，自动批处理 |
| 样式引擎 | Tailwind CSS | 4.x | JIT 模式，`dark:` 变体 |
| 图标库 | Lucide React | latest | 统一 SVG 图标 |
| 状态管理 | React Hooks | — | `useState` / `useEffect` / `useCallback` / `useMemo` |
| 数据请求 | Fetch API | — | 原生 `fetch` + `AbortController` |
| 持久化 | localStorage | — | 收藏夹、主题偏好 |
| 邮件定时任务 | GitHub Actions | — | 每周定时触发 |
| 邮件发送 | Nodemailer | latest | SMTP 发送 HTML 邮件 |

## 🎨 设计规范

### 主题色

| 元素 | Light Mode | Dark Mode |
|------|------------|-----------|
| 页面背景 | `#f6f8fa` | `#0d1117` |
| 卡片背景 | `#ffffff` | `#161b22` |
| 主文字 | `#1f2328` | `#e6edf3` |
| 主色调 | `#0969da` | `#58a6ff` |
| 收藏高亮 | `#bf8700` | `#e3b341` |

### 排版

- **仓库名** — JetBrains Mono, 600 weight, 15px
- **描述文字** — 系统字体栈, 400 weight, 13px
- **统计数字** — JetBrains Mono, 400 weight, 12px

### 响应式断点

| 断点 | 宽度 | 卡片列数 |
|------|------|---------|
| Mobile | < 640px | 1 列 |
| Tablet | 640–1024px | 2 列 |
| Desktop | > 1024px | 3 列 |

## 📝 设计决策

1. **零外部状态库** — 所有状态通过 React 原生 Hooks 管理，保持依赖树轻量
2. **零 CSS-in-JS** — 纯 Tailwind 类名，避免运行时样式计算开销
3. **AbortController 竞态处理** — 每次新请求自动取消上一个未完成请求
4. **简单缓存策略** — `useRef` + Map 缓存最近 5 次请求结果
5. **React.memo 优化** — RepoCard 组件包裹 memo，避免父组件重渲染导致的无效更新

## 📄 License

[MIT](LICENSE) © [lihuiyu301-alt](https://github.com/lihuiyu301-alt)

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！**

</div>
