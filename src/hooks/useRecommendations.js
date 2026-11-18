import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRecommendationLists } from '../utils/recommendations';

const CACHE_TTL = 30 * 60 * 1000;
const EMPTY_DATA = { weekly: [], hallOfFame: [], active: [] };
const cache = new Map();

function getCacheKey(language, category, hideCollections) {
  return `${category || 'all'}|${language || '__all__'}|${hideCollections}`;
}

export function useRecommendations({ language = '', category = 'all', hideCollections = true, enabled = true } = {}) {
  const [state, setState] = useState({
    cacheKey: undefined,
    data: EMPTY_DATA,
    error: null,
    failedTypes: [],
    loading: false,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const currentCacheKey = getCacheKey(language, category, hideCollections);
  const isCurrentKey = state.cacheKey === currentCacheKey;
  const data = isCurrentKey ? state.data : EMPTY_DATA;
  const error = isCurrentKey ? state.error : null;
  const failedTypes = isCurrentKey ? state.failedTypes : [];
  const loading = enabled && (!isCurrentKey || state.loading);

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = getCacheKey(language, category, hideCollections);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({
        cacheKey,
        data: cached.data,
        error: cached.error,
        failedTypes: cached.failedTypes,
        loading: false,
      });
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((previous) => ({
      cacheKey,
      data: previous.cacheKey === cacheKey ? previous.data : EMPTY_DATA,
      error: null,
      failedTypes: [],
      loading: true,
    }));

    fetchRecommendationLists({
      language,
      category,
      hideCollections,
      token: import.meta.env.VITE_GITHUB_TOKEN,
      signal: controller.signal,
    })
      .then((result) => {
        if (result.aborted || controller.signal.aborted || requestId !== requestIdRef.current) return;

        const nextData = {
          weekly: result.weekly,
          hallOfFame: result.hallOfFame,
          active: result.active,
        };
        const nextFailedTypes = Object.keys(result.errors);
        const nextError = result.allFailed
          ? result.errors.weekly || result.errors.hallOfFame || result.errors.active
          : null;

        setState({
          cacheKey,
          data: nextData,
          error: nextError,
          failedTypes: nextFailedTypes,
          loading: false,
        });
        cache.set(cacheKey, {
          data: nextData,
          error: nextError,
          failedTypes: nextFailedTypes,
          timestamp: Date.now(),
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError' || controller.signal.aborted || requestId !== requestIdRef.current) return;

        setState({
          cacheKey,
          data: EMPTY_DATA,
          error: err,
          failedTypes: [],
          loading: false,
        });
      });

    return () => controller.abort();
  }, [language, category, hideCollections, enabled, reloadToken]);

  const retry = useCallback(() => {
    const cacheKey = getCacheKey(language, category, hideCollections);
    cache.delete(cacheKey);
    setState((previous) => ({
      cacheKey,
      data: previous.cacheKey === cacheKey ? previous.data : EMPTY_DATA,
      error: null,
      failedTypes: [],
      loading: true,
    }));
    setReloadToken((value) => value + 1);
  }, [language, category, hideCollections]);

  return { data, loading, error, failedTypes, retry };
}
