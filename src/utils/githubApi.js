/**
 * GitHub API 工具函数
 * 封装请求构建、日期计算、数字格式化与 AI 热门项目聚合请求
 */

import { getAiCategory } from '../config/aiCategories.js';
import { rankAiRepos } from './aiRanking.js';

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
  return buildHeaders(import.meta.env?.VITE_GITHUB_TOKEN);
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
 * 日均 Star 增速格式化：123.4 → 123/天，1200 → 1.2k/天
 * @param {number} num
 * @returns {string}
 */
export function formatStarsPerDay(num) {
  if (num == null || Number.isNaN(num)) return '0/天';
  if (num >= 1000) return `${formatNumber(Math.round(num))}/天`;
  if (num >= 10) return `${Math.round(num)}/天`;
  return `${num.toFixed(1).replace(/\.0$/, '')}/天`;
}

/**
 * 构建 AI 细分赛道的多路 GitHub Search 查询字符串
 * @param {Object} params
 * @param {string} [params.category='all']
 * @param {string} [params.language='']
 * @param {'today'|'week'|'month'} [params.dateRange='week']
 * @param {'trending'|'new'} [params.mode='trending']
 * @param {string} [params.keyword='']
 * @returns {string[]}
 */
export function buildAiQueries({
  category = 'all',
  language = '',
  dateRange = 'week',
  mode = 'trending',
  keyword = '',
} = {}) {
  const date = getDateFilter(dateRange);
  const aiCategory = getAiCategory(category);
  const minStarsMap = { today: 20, week: 50, month: 100 };
  const timeQualifier = mode === 'new'
    ? `created:>${date}`
    : `pushed:>${date} stars:>${minStarsMap[dateRange] || 50} archived:false`;

  const languageQualifier = language ? ` language:${language}` : '';
  const keywordQualifier = keyword ? ` ${keyword} in:name,description` : '';

  const topicQueries = keyword ? [aiCategory.queries[0]] : aiCategory.queries;

  return topicQueries.map(
    (topic) => `${topic} ${timeQualifier}${languageQualifier}${keywordQualifier}`
  );
}

/**
 * 发起 AI 热门仓库聚合请求（多路 topic 查询合并去重 + 热度重排）
 * @param {Object} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ items: Array, total_count: number }>}
 */
export async function fetchAiRepos(params = {}, signal) {
  const {
    category = 'all',
    language = '',
    dateRange = 'week',
    mode = 'trending',
    keyword = '',
    sort = 'trending',
    hideCollections = true,
    page = 1,
    token,
  } = params;

  const queries = buildAiQueries({ category, language, dateRange, mode, keyword });
  const apiSort = sort === 'trending' ? 'stars' : sort;
  const headers = token !== undefined ? buildHeaders(token) : getHeaders();

  const results = await Promise.allSettled(
    queries.map((q) =>
      searchRepos({
        q,
        sort: apiSort,
        perPage: 25,
        page,
        headers,
        signal,
      })
    )
  );

  const aborted = Boolean(signal?.aborted) || results.some(
    (res) => res.status === 'rejected' && res.reason?.name === 'AbortError'
  );
  if (aborted) {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  const fulfilled = results.filter((res) => res.status === 'fulfilled').map((res) => res.value);
  if (fulfilled.length === 0) {
    const firstRejected = results.find((res) => res.status === 'rejected');
    throw firstRejected?.reason || { code: 'NETWORK_ERROR', message: 'Failed to fetch AI repos' };
  }

  const mergedItems = fulfilled.flatMap((data) => data.items || []);
  const rankedItems = rankAiRepos(mergedItems, { hideCollections, sort });
  const totalCount = Math.max(...fulfilled.map((data) => data.total_count || 0), rankedItems.length);

  return {
    items: rankedItems,
    total_count: totalCount,
  };
}

/**
 * 发起 GitHub 搜索请求（兼容旧调用，默认走 AI 热门聚合）
 * @param {Object} params - 请求参数
 * @param {AbortSignal} signal - AbortController 信号
 * @returns {Promise<Object>} API 响应数据
 */
export async function fetchRepos(params, signal) {
  return fetchAiRepos(params, signal);
}
