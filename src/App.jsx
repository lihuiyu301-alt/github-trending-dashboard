import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { RepoList } from './components/RepoList';
import { BookmarkList } from './components/BookmarkList';
import { ToastContainer } from './components/Toast';
import { BackToTop } from './components/BackToTop';
import { useGithubSearch } from './hooks/useGithubSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import t from './i18n/zh-CN';

/**
 * 应用主组件
 * 管理全局状态、URL 同步、布局
 */
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, isBookmarked, toggleBookmark, clearAll, exportBookmarks, importBookmarks } = useBookmarks();
  const { toasts, showToast, removeToast } = useToast();

  // 收藏切换 + Toast 反馈
  const handleToggleBookmark = useCallback((repo) => {
    const wasBookmarked = isBookmarked(repo.id);
    toggleBookmark(repo);
    showToast(
      wasBookmarked ? t.toast.bookmarkRemoved : t.toast.bookmarkAdded,
      wasBookmarked ? 'info' : 'success'
    );
  }, [isBookmarked, toggleBookmark, showToast]);

  // 筛选状态
  const [language, setLanguage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') || '';
  });
  const [dateRange, setDateRange] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('range') || 'week';
  });
  const [keyword, setKeyword] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  });
  const [sort, setSort] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sort') || 'stars';
  });
  const [activeTab, setActiveTab] = useState('trending');

  // API 请求
  const { repos, loading, error, total, loadMore, hasMore } = useGithubSearch({
    language,
    dateRange,
    keyword,
    sort,
  });

  // URL 同步
  useEffect(() => {
    const params = new URLSearchParams();
    if (language) params.set('lang', language);
    if (dateRange !== 'week') params.set('range', dateRange);
    if (keyword) params.set('q', keyword);
    if (sort !== 'stars') params.set('sort', sort);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [language, dateRange, keyword, sort]);

  // 重试回调
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // 全局键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 忽略输入框内的按键
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const input = document.querySelector('input[aria-label]');
        if (input) {
          input.focus();
          // 触发搜索框展开
          input.dispatchEvent(new Event('focus', { bubbles: true }));
        }
      } else if (e.key === 't' && !isInput) {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'b' && !isInput) {
        e.preventDefault();
        setActiveTab('bookmarks');
      } else if (e.key === 'Escape' && isInput) {
        e.target.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme]);

  return (
    <div className="min-h-screen transition-colors duration-200"
      style={{
        backgroundColor: theme === 'dark' ? '#0d1117' : '#f6f8fa',
        color: theme === 'dark' ? '#e6edf3' : '#1f2328',
      }}>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        keyword={keyword}
        onSearch={setKeyword}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bookmarkCount={bookmarks.length}
      />

      {activeTab === 'trending' && (
        <FilterBar
          language={language}
          onLanguageChange={setLanguage}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sort={sort}
          onSortChange={setSort}
          theme={theme}
        />
      )}

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'trending' ? (
          <>
            {/* 结果统计 */}
            {!loading && total > 0 && (
              <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#7d8590' : '#656d76' }}>
                {t.list.found.replace('{total}', total.toLocaleString())}
              </p>
            )}
            <RepoList
              repos={repos}
              loading={loading}
              error={error}
              theme={theme}
              onToggleBookmark={handleToggleBookmark}
              isBookmarked={isBookmarked}
              onRetry={handleRetry}
              hasMore={hasMore}
              onLoadMore={loadMore}
              keyword={keyword}
            />
          </>
        ) : (
          <BookmarkList
            bookmarks={bookmarks}
            theme={theme}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onClearAll={clearAll}
            onExport={exportBookmarks}
            onImport={importBookmarks}
            showToast={showToast}
          />
        )}
      </main>

      {/* 页脚 */}
      <footer className="text-center py-6 text-xs"
        style={{ color: theme === 'dark' ? '#484f58' : '#8b949e' }}>
        {t.footer}
      </footer>

      {/* 回到顶部 */}
      <BackToTop theme={theme} />

      {/* Toast 提示 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} theme={theme} />
    </div>
  );
}
