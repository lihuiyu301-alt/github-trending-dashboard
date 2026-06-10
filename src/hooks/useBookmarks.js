import { useState, useCallback } from 'react';

const STORAGE_KEY = 'github-trending-bookmarks';

/**
 * 收藏夹 localStorage 管理 Hook
 * @returns {{
 *   bookmarks: Array,
 *   isBookmarked: (id: number) => boolean,
 *   toggleBookmark: (repo: Object) => void,
 *   clearAll: () => void,
 *   exportBookmarks: () => void,
 *   importBookmarks: (json: string) => { success: boolean, count: number, error?: string }
 * }}
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const persist = useCallback((next) => {
    setBookmarks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const isBookmarked = useCallback(
    (id) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (repo) => {
      if (isBookmarked(repo.id)) {
        persist(bookmarks.filter((b) => b.id !== repo.id));
      } else {
        persist([...bookmarks, repo]);
      }
    },
    [bookmarks, isBookmarked, persist]
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  /** 导出收藏夹为 JSON 文件下载 */
  const exportBookmarks = useCallback(() => {
    const json = JSON.stringify(bookmarks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bookmarks]);

  /** 从 JSON 字符串导入收藏，返回结果 */
  const importBookmarks = useCallback((json) => {
    try {
      const data = JSON.parse(json);
      if (!Array.isArray(data)) {
        return { success: false, count: 0, error: '格式错误：不是数组' };
      }
      // 验证每条数据至少有 id
      const valid = data.filter((item) => item && typeof item.id === 'number');
      if (valid.length === 0) {
        return { success: false, count: 0, error: '未找到有效的收藏数据' };
      }
      // 合并去重（以 id 为主键）
      const merged = [...bookmarks];
      let added = 0;
      for (const item of valid) {
        if (!merged.some((b) => b.id === item.id)) {
          merged.push(item);
          added++;
        }
      }
      persist(merged);
      return { success: true, count: added };
    } catch {
      return { success: false, count: 0, error: 'JSON 解析失败' };
    }
  }, [bookmarks, persist]);

  return { bookmarks, isBookmarked, toggleBookmark, clearAll, exportBookmarks, importBookmarks };
}
