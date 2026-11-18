import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRepos } from '../utils/githubApi';

function mergeUniqueRepos(prev, next) {
  const seen = new Set(prev.map((item) => item.id));
  const merged = [...prev];
  for (const item of next) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return merged;
}

/**
 * 封装 GitHub AI 热门项目搜索逻辑的自定义 Hook
 * 支持 AbortController 竞态取消、简单缓存、错误分类
 */
export function useGithubSearch({
  category = 'all',
  language = '',
  dateRange = 'week',
  mode = 'trending',
  keyword = '',
  sort = 'trending',
  hideCollections = true,
  page = 1,
}) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

  const abortRef = useRef(null);
  const cacheRef = useRef(new Map());

  const getCacheKey = useCallback(
    (p) => `${category}|${language}|${dateRange}|${mode}|${keyword}|${sort}|${hideCollections}|${p}`,
    [category, language, dateRange, mode, keyword, sort, hideCollections]
  );

  useEffect(() => {
    setRepos([]);
    setCurrentPage(1);
    setError(null);
  }, [category, language, dateRange, mode, keyword, sort, hideCollections]);

  useEffect(() => {
    const key = getCacheKey(currentPage);

    if (cacheRef.current.has(key)) {
      const cached = cacheRef.current.get(key);
      if (currentPage === 1) {
        setRepos(cached.items);
      } else {
        setRepos((prev) => mergeUniqueRepos(prev, cached.items));
      }
      setTotal(cached.total_count);
      setLoading(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchRepos(
      { category, language, dateRange, mode, keyword, sort, hideCollections, page: currentPage },
      controller.signal
    )
      .then((data) => {
        if (cacheRef.current.size >= 8) {
          const firstKey = cacheRef.current.keys().next().value;
          cacheRef.current.delete(firstKey);
        }
        cacheRef.current.set(key, data);

        if (currentPage === 1) {
          setRepos(data.items || []);
        } else {
          setRepos((prev) => mergeUniqueRepos(prev, data.items || []));
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
  }, [category, language, dateRange, mode, keyword, sort, hideCollections, currentPage, getCacheKey]);

  const loadMore = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const hasMore = repos.length < total && repos.length < 1000;

  return { repos, loading, error, total, loadMore, hasMore };
}
