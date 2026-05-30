import { useState, useCallback } from 'react';

const STORAGE_KEY = 'github-trending-bookmarks';

/**
 * 收藏夹 localStorage 管理 Hook
 * @returns {{
 *   bookmarks: Array,
 *   isBookmarked: (id: number) => boolean,
 *   toggleBookmark: (repo: Object) => void,
 *   clearAll: () => void
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

  return { bookmarks, isBookmarked, toggleBookmark, clearAll };
}
