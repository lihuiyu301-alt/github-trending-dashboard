/**
 * GitHub API 工具函数
 * 封装请求构建、日期计算、数字格式化等工具
 */

const API_BASE = 'https://api.github.com/search/repositories';

/**
 * 根据时间范围计算起始日期
 * @param {'today'|'week'|'month'} range - 时间范围
 * @returns {string} YYYY-MM-DD 格式的日期字符串
 */
export function getDateFilter(range) {
  const date = new Date();
  if (range === 'today') date.setDate(date.getDate() - 1);
  if (range === 'week') date.setDate(date.getDate() - 7);
  if (range === 'month') date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * 构建搜索查询字符串
 * @param {Object} params
 * @param {string} params.language - 语言筛选，空字符串表示全部
 * @param {'today'|'week'|'month'} params.dateRange - 时间范围
 * @param {string} params.keyword - 搜索关键词
 * @returns {string} GitHub Search API 的 q 参数
 */
export function buildSearchQuery({ language = '', dateRange = 'week', keyword = '' }) {
  const date = getDateFilter(dateRange);
  let q = `created:>${date}`;

  if (language) {
    q += ` language:${language}`;
  }

  if (keyword) {
    q += ` ${keyword} in:name,description`;
  }

  return q;
}

/**
 * 构建 GitHub Search API 的完整 URL
 * @param {Object} params
 * @param {string} params.language - 语言筛选，空字符串表示全部
 * @param {'today'|'week'|'month'} params.dateRange - 时间范围
 * @param {string} params.keyword - 搜索关键词
 * @param {'stars'|'forks'|'updated'} params.sort - 排序方式
 * @param {number} params.page - 页码
 * @returns {string} 完整的 API URL
 */
export function buildApiUrl({ language = '', dateRange = 'week', keyword = '', sort = 'stars', page = 1 }) {
  const params = new URLSearchParams({
    q: buildSearchQuery({ language, dateRange, keyword }),
    sort,
    order: 'desc',
    per_page: '25',
    page: String(page),
  });

  return `${API_BASE}?${params.toString()}`;
}

/**
 * 构建请求头，支持可选的 GitHub Token
 * @param {string} [token] - GitHub Personal Access Token
 * @returns {Object} 请求头对象
 */
export function buildHeaders(token) {
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
}

/**
 * 获取浏览器端请求头
 * @returns {Object} 请求头对象
 */
export function getHeaders() {
  return buildHeaders(import.meta.env.VITE_GITHUB_TOKEN);
}

/**
 * 数字格式化：12400 → 12.4k，1200000 → 1.2M
 * @param {number} num - 待格式化的数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
  if (num == null) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

/**
 * 发起 GitHub 搜索请求
 * @param {Object} params - 请求参数
 * @param {string} params.q - GitHub 搜索查询字符串
 * @param {'stars'|'forks'|'updated'} [params.sort] - 排序方式
 * @param {'desc'|'asc'} [params.order] - 排序方向
 * @param {number} [params.perPage] - 每页结果数
 * @param {number} [params.page] - 页码
 * @param {Object} [params.headers] - 请求头
 * @param {AbortSignal} [params.signal] - AbortController 信号
 * @returns {Promise<Object>} API 响应数据
 */
export async function searchRepos({
  q,
  sort = 'stars',
  order = 'desc',
  perPage = 25,
  page = 1,
  headers = {},
  signal,
}) {
  const params = new URLSearchParams({
    q,
    sort,
    order,
    per_page: String(perPage),
    page: String(page),
  });

  const response = await fetch(`${API_BASE}?${params.toString()}`, { headers, signal });

  if (response.status === 403 || response.status === 422) {
    throw { code: 'RATE_LIMIT', message: 'GitHub API rate limit exceeded' };
  }

  if (!response.ok) {
    throw { code: 'NETWORK_ERROR', message: `HTTP ${response.status}` };
  }

  return response.json();
}

/**
 * 发起 GitHub 搜索请求
 * @param {Object} params - 请求参数
 * @param {AbortSignal} signal - AbortController 信号
 * @returns {Promise<Object>} API 响应数据
 */
export async function fetchRepos(params, signal) {
  const { language = '', dateRange = 'week', keyword = '', sort = 'stars', page = 1 } = params;

  return searchRepos({
    q: buildSearchQuery({ language, dateRange, keyword }),
    sort,
    perPage: 25,
    page,
    headers: getHeaders(),
    signal,
  });
}
