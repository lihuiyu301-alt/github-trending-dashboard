<div align="center">

# 🔥 GitHub Trending Dashboard

**实时发现 GitHub 上最火的开源项目**

一个现代化、响应式的 GitHub 热门项目看板，帮助开发者追踪技术趋势、发现优质开源项目。

[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## ✨ 功能特性

- [x] 🔥 **热门项目浏览** — 基于 GitHub Search API，按 Star 数降序展示最火项目
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

## 📁 项目结构

```
github-trending-dashboard/
├── public/                     # 静态资源
├── src/
│   ├── components/             # UI 组件
│   │   ├── Navbar.jsx          # 导航栏（Logo、搜索、主题切换）
│   │   ├── FilterBar.jsx       # 筛选栏（语言 + 时间范围）
│   │   ├── RepoCard.jsx        # 仓库卡片（React.memo 优化）
│   │   ├── RepoList.jsx        # 卡片网格容器
│   │   ├── SkeletonCard.jsx    # 骨架卡片
│   │   ├── SkeletonLoader.jsx  # 骨架屏加载器
│   │   ├── EmptyState.jsx      # 空状态 / 错误状态
│   │   ├── BookmarkList.jsx    # 收藏夹页面
│   │   └── ErrorBoundary.jsx   # 错误边界
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useGithubSearch.js  # API 请求 + 缓存 + 竞态处理
│   │   ├── useBookmarks.js     # 收藏夹 localStorage 管理
│   │   └── useTheme.js         # 主题切换 + 持久化
│   ├── utils/                  # 工具函数
│   │   ├── githubApi.js        # URL 构建、日期计算、数字格式化
│   │   └── languageColors.js   # GitHub 官方语言颜色映射
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 入口文件
│   └── index.css               # 全局样式 + Tailwind 配置
├── tailwind.config.js          # Tailwind 配置
├── vite.config.js              # Vite 配置
├── package.json
└── README.md
```

## 🛠️ 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 构建工具 | Vite | 8.x | 极速 HMR，ESM 原生支持 |
| 前端框架 | React | 18.x | Concurrent Mode，自动批处理 |
| 样式引擎 | Tailwind CSS | 4.x | JIT 模式，`dark:` 变体 |
| 图标库 | Lucide React | latest | 统一 SVG 图标 |
| 状态管理 | React Hooks | — | `useState` / `useEffect` / `useCallback` / `useMemo` |
| 数据请求 | Fetch API | — | 原生 `fetch` + `AbortController` |
| 持久化 | localStorage | — | 收藏夹、主题偏好 |

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
