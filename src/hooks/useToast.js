import { useState, useCallback, useRef } from 'react';

/**
 * Toast 提示 Hook
 * 提供轻量级的全局 Toast 提示功能
 * @param {number} duration - 显示时长（ms），默认 2000
 * @returns {{ toasts: Array, showToast: (message: string, type?: string) => void }}
 */
export function useToast(duration = 2000) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, [duration]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}
