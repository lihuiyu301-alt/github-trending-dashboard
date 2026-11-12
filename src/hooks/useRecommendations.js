import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRecommendationLists } from '../utils/recommendations';

const CACHE_TTL = 30 * 60 * 1000;
const EMPTY_DATA = { weekly: [], hallOfFame: [], active: [] };
const cache = new Map();

function getCacheKey(language) {
  return language || '__all__';
}

export function useRecommendations({ language = '', enabled = true } = {}) {
  const [state, setState] = useState({
    language: undefined,
    data: EMPTY_DATA,
    error: null,
    failedTypes: [],
    loading: false,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const isCurrentLanguage = state.language === language;
  const data = isCurrentLanguage ? state.data : EMPTY_DATA;
  const error = isCurrentLanguage ? state.error : null;
  const failedTypes = isCurrentLanguage ? state.failedTypes : [];
  const loading = enabled && (!isCurrentLanguage || state.loading);

  useEffect(() => {
    if (!enabled) return;

    const cacheKey = getCacheKey(language);
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState({
        language,
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
      language,
      data: previous.language === language ? previous.data : EMPTY_DATA,
      error: null,
      failedTypes: [],
      loading: true,
    }));

    fetchRecommendationLists({
      language,
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
          language,
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
          language,
          data: EMPTY_DATA,
          error: err,
          failedTypes: [],
          loading: false,
        });
      });

    return () => controller.abort();
  }, [language, enabled, reloadToken]);

  const retry = useCallback(() => {
    cache.delete(getCacheKey(language));
    setState((previous) => ({
      language,
      data: previous.language === language ? previous.data : EMPTY_DATA,
      error: null,
      failedTypes: [],
      loading: true,
    }));
    setReloadToken((value) => value + 1);
  }, [language]);

  return { data, loading, error, failedTypes, retry };
}
