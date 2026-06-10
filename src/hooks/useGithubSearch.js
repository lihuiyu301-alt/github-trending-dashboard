import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRepos } from '../utils/githubApi';

/**
 * 封装 GitHub Search API 请求逻辑的自定义 Hook
 * 支持 AbortController 竞态取消、简单缓存、错误分类
 * @param {Object} params
 * @param {string} params.language - 语言筛选，'' 表示全部
 * @param {'today'|'week'|'month'} params.dateRange - 时间范围
 * @param {string} params.keyword - 搜索关键词
 * @param {'stars'|'forks'|'updated'} params.sort - 排序方式
 * @param {number} params.page - 当前页码，默认 1
 * @returns {{ repos: Array, loading: boolean, error: Object|null, total: number, loadMore: () => void, hasMore: boolean }}
 */
export function useGithubSearch({ language = '', dateRange = 'week', keyword = '', sort = 'stars', page = 1 }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());

  // 生成缓存 key
  const getCacheKey = useCallback(
    (p) => `${language}|${dateRange}|${keyword}|${sort}|${p}`,
    [language, dateRange, keyword, sort]
  );

  // 当筛选参数变化时重置页码和结果
  useEffect(() => {
    setRepos([]);
    setCurrentPage(1);
    setError(null);
  }, [language, dateRange, keyword, sort]);

  // 发起请求
  useEffect(() => {
    const key = getCacheKey(currentPage);

    // 检查缓存
    if (cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      if (currentPage === 1) {
        setRepos(cached.items);
      } else {
        setRepos((prev) => [...prev, ...cached.items]);
      }
      setTotal(cached.total_count);
      setLoading(false);
      return;
    }

    // 取消上一个请求
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchRepos(
      { language, dateRange, keyword, sort, page: currentPage },
      controller.signal
    )
      .then((data) => {
        // 写入缓存（保留最近 5 条）
        if (cacheRef.current.size >= 5) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, data);

        if (currentPage === 1) {
          setRepos(data.items || []);
        } else {
          setRepos((prev) => [...prev, ...(data.items || [])]);
        }
        setTotal(data.total_count || 0);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [language, dateRange, keyword, currentPage, getCacheKey]);

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const hasMore = repos.length < total && repos.length < 1000; // GitHub API 限制最多 1000 条

  return { repos, loading, error, total, loadMore, hasMore };
}
