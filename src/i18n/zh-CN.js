/**
 * 中文语言包
 * 集中管理所有 UI 文本，避免硬编码
 */
const zhCN = {
  // 导航栏
  nav: {
    title: 'AI 热门趋势',
    trending: 'AI 排行',
    bookmarks: '收藏夹',
    searchPlaceholder: '搜索 AI 仓库...',
  },

  // 筛选栏
  filter: {
    all: '全部语言',
    today: '今天',
    week: '本周',
    month: '本月',
    sortTrending: '综合热度排行',
    sortStars: '按 Star 排序',
    sortForks: '按 Fork 排序',
    sortUpdated: '按更新时间排序',
    hideCollections: '过滤合集',
  },

  // 推荐区
  recommendation: {
    title: 'AI 本周精选',
    subtitle: '聚焦当前 AI 赛道与语言，聚合新晋黑马与活跃飙升项目',
    weeklyNew: 'AI 本周新晋',
    weeklyNewDesc: '近 7 天新建、Star 最多',
    hallOfFame: 'AI 殿堂级项目',
    hallOfFameDesc: '历史 Star 最高',
    active: 'AI 近期飙升',
    activeDesc: '近 7 天有更新、综合热度最高',
    digestNote: '每周一 09:00 推送 AI 热门速递',
    empty: '暂无数据',
    error: '推荐加载失败',
    retry: '重试',
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
    exportBtn: '导出',
    importBtn: '导入',
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

  // Toast 提示
  toast: {
    bookmarkAdded: '已收藏',
    bookmarkRemoved: '已取消收藏',
  },
};

export default zhCN;
