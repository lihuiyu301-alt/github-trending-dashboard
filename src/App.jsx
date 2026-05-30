import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { RepoList } from './components/RepoList';
import { BookmarkList } from './components/BookmarkList';
import { useGithubSearch } from './hooks/useGithubSearch';
import { useBookmarks } from './hooks/useBookmarks';
import { useTheme } from './hooks/useTheme';

/**
 * 应用主组件
 * 管理全局状态、URL 同步、布局
 */
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { bookmarks, isBookmarked, toggleBookmark, clearAll } = useBookmarks();

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
  const [activeTab, setActiveTab] = useState('trending');

  // API 请求
  const { repos, loading, error, total, loadMore, hasMore } = useGithubSearch({
    language,
    dateRange,
    keyword,
  });

  // URL 同步
  useEffect(() => {
    const params = new URLSearchParams();
    if (language) params.set('lang', language);
    if (dateRange !== 'week') params.set('range', dateRange);
    if (keyword) params.set('q', keyword);
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [language, dateRange, keyword]);

  // 重试回调
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

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
          theme={theme}
        />
      )}

      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'trending' ? (
          <>
            {/* 结果统计 */}
            {!loading && total > 0 && (
              <p className="text-sm mb-4" style={{ color: theme === 'dark' ? '#7d8590' : '#656d76' }}>
                Found {total.toLocaleString()} repositories
              </p>
            )}
            <RepoList
              repos={repos}
              loading={loading}
              error={error}
              theme={theme}
              onToggleBookmark={toggleBookmark}
              isBookmarked={isBookmarked}
              onRetry={handleRetry}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </>
        ) : (
          <BookmarkList
            bookmarks={bookmarks}
            theme={theme}
            onToggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
            onClearAll={clearAll}
          />
        )}
      </main>

      {/* 页脚 */}
      <footer className="text-center py-6 text-xs"
        style={{ color: theme === 'dark' ? '#484f58' : '#8b949e' }}>
        GitHub Trending Dashboard — Built with React + Tailwind CSS
      </footer>
    </div>
  );
}
