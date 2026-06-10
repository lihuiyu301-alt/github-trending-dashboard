import { useState, useRef, useCallback } from 'react';

const TRANSLATE_API = 'https://api.mymemory.translated.net/get';
const MAX_CONCURRENT = 3; // 最大并发翻译请求数

// 全局缓存，所有组件共享
const translationCache = new Map();

// 全局请求队列
let activeRequests = 0;
const pendingQueue = [];

function runOrQueue(fn) {
  if (activeRequests < MAX_CONCURRENT) {
    activeRequests++;
    fn().finally(() => {
      activeRequests--;
      if (pendingQueue.length > 0) {
        const next = pendingQueue.shift();
        next();
      }
    });
  } else {
    pendingQueue.push(() => {
      activeRequests++;
      return fn().finally(() => {
        activeRequests--;
        if (pendingQueue.length > 0) {
          const next = pendingQueue.shift();
          next();
        }
      });
    });
  }
}

/**
 * 翻译 Hook
 * 调用 MyMemory 免费翻译 API，将英文文本翻译为中文
 * 内置缓存 + 并发队列，避免请求过多
 * @param {string} text - 待翻译的英文文本
 * @returns {{
 *   translated: string|null,
 *   loading: boolean,
 *   error: boolean,
 *   translate: () => void,
 *   showOriginal: () => void,
 *   isTranslated: boolean
 * }}
 */
export function useTranslate(text) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortRef = useRef(null);

  const isTranslated = translated !== null;

  const translate = useCallback(() => {
    if (!text) return;

    // 检查缓存
    const cacheKey = text.slice(0, 200); // 截断长文本作为 key
    if (translationCache.has(cacheKey)) {
      setTranslated(translationCache.get(cacheKey));
      return;
    }

    // 取消上一个请求
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(false);

    const url = `${TRANSLATE_API}?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|zh-CN`;

    runOrQueue(async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          const result = data.responseData.translatedText;
          translationCache.set(cacheKey, result);
          setTranslated(result);
        } else {
          setError(true);
        }
      } catch (err) {
        if (err.name !== 'AbortError') setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    });
  }, [text]);

  const showOriginal = useCallback(() => {
    setTranslated(null);
    setError(false);
  }, []);

  return { translated, loading, error, translate, showOriginal, isTranslated };
}
