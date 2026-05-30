/**
 * 中文语言包
 * 集中管理所有 UI 文本，避免硬编码
 */
const zhCN = {
  // 导航栏
  nav: {
    title: '热门趋势',
    trending: '热门',
    bookmarks: '收藏夹',
    searchPlaceholder: '搜索仓库...',
  },

  // 筛选栏
  filter: {
    all: '全部',
    today: '今天',
    week: '本周',
    month: '本月',
  },

  // 仓库卡片
  card: {
    more: '+{n} 更多',
    avatarAlt: '{owner} 的头像',
  },

  // 列表
  list: {
    loading: '加载中...',
    loadMore: '加载更多',
    found: '共找到 {total} 个仓库',
  },

  // 收藏夹
  bookmark: {
    emptyTitle: '暂无收藏',
    emptyDesc: '浏览热门页面，点击卡片右上角的书签图标来收藏项目',
    count: '共 {n} 个收藏项目',
    clearAll: '清空全部',
    addTo: '收藏 {name}',
    removeFrom: '取消收藏 {name}',
  },

  // 错误与空状态
  error: {
    rateLimitTitle: '🚦 请求过于频繁',
    rateLimitDesc: 'GitHub API 每小时限制 60 次请求。您可以登录 GitHub 获得更高配额。',
    retry: '稍后重试',
    learnMore: '了解 Rate Limit',
    networkTitle: '网络连接失败',
    networkDesc: '请检查网络连接后重试',
    reload: '重新加载',
    emptyTitle: '暂无热门项目',
    emptyDesc: '该语言/时间段暂无热门项目，试试切换筛选条件',
    crashTitle: '出现了一些问题',
    crashDesc: '应用遇到了意外错误，请刷新页面重试。',
    crashReload: '刷新页面',
  },

  // 页脚
  footer: 'GitHub 热门项目看板 — 基于 React + Tailwind CSS 构建',

  // 无障碍标签
  a11y: {
    search: '搜索仓库',
    clearSearch: '清除搜索',
    switchTheme: '切换到{mode}模式',
    selectLang: '选择编程语言',
    selectRange: '选择时间范围',
    darkMode: '深色',
    lightMode: '浅色',
  },

  // 翻译功能
  translate: {
    button: '翻译',
    showOriginal: '查看原文',
    translating: '翻译中...',
    error: '翻译失败',
  },
};

export default zhCN;
