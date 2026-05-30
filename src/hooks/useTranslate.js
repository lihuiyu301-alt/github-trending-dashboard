import { useState, useRef, useCallback } from 'react';

const TRANSLATE_API = 'https://api.mymemory.translated.net/get';

// 全局缓存，所有组件共享
const translationCache = new Map();

/**
 * 翻译 Hook
 * 调用 MyMemory 免费翻译 API，将英文文本翻译为中文
 * 内置缓存，避免重复请求
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

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.responseStatus === 200 && data.responseData?.translatedText) {
          const result = data.responseData.translatedText;
          translationCache.set(cacheKey, result);
          setTranslated(result);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [text]);

  const showOriginal = useCallback(() => {
    setTranslated(null);
    setError(false);
  }, []);

  return { translated, loading, error, translate, showOriginal, isTranslated };
}
