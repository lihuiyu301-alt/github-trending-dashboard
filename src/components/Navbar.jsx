import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Search, X, Bookmark, TrendingUp } from 'lucide-react';

/**
 * 顶部导航栏组件
 * 包含 Logo、搜索框、主题切换、收藏夹入口
 * @param {Object} props
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {() => void} props.toggleTheme - 切换主题
 * @param {string} props.keyword - 搜索关键词
 * @param {(keyword: string) => void} props.onSearch - 搜索回调
 * @param {'trending'|'bookmarks'} props.activeTab - 当前页签
 * @param {(tab: 'trending'|'bookmarks') => void} props.onTabChange - 页签切换
 * @param {number} props.bookmarkCount - 收藏数量
 */
export function Navbar({ theme, toggleTheme, keyword, onSearch, activeTab, onTabChange, bookmarkCount }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(keyword);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setSearchValue(keyword);
  }, [keyword]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(13,17,23,0.85)' : 'rgba(246,248,250,0.85)',
        borderColor: theme === 'dark' ? '#30363d' : '#d0d7de',
      }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => onTabChange('trending')}>
          <TrendingUp className="w-5 h-5" style={{ color: theme === 'dark' ? '#58a6ff' : '#0969da' }} />
          <span className="font-semibold text-base hidden sm:inline"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: theme === 'dark' ? '#e6edf3' : '#1f2328',
            }}>
            Trending
          </span>
        </div>

        {/* 页签导航 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('trending')}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: activeTab === 'trending'
                ? (theme === 'dark' ? '#21262d' : '#e8ecf0')
                : 'transparent',
              color: activeTab === 'trending'
                ? (theme === 'dark' ? '#e6edf3' : '#1f2328')
                : (theme === 'dark' ? '#7d8590' : '#656d76'),
            }}
          >
            Trending
          </button>
          <button
            onClick={() => onTabChange('bookmarks')}
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5"
            style={{
              backgroundColor: activeTab === 'bookmarks'
                ? (theme === 'dark' ? '#21262d' : '#e8ecf0')
                : 'transparent',
              color: activeTab === 'bookmarks'
                ? (theme === 'dark' ? '#e6edf3' : '#1f2328')
                : (theme === 'dark' ? '#7d8590' : '#656d76'),
            }}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarkCount > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: theme === 'dark' ? '#30363d' : '#d0d7de',
                  color: theme === 'dark' ? '#e6edf3' : '#1f2328',
                }}>
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>

        {/* 右侧：搜索 + 主题切换 */}
        <div className="flex items-center gap-2">
          {/* 搜索框 */}
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search repos..."
              className="search-expand rounded-md pl-8 pr-8 py-1.5 text-sm outline-none"
              style={{
                width: searchOpen ? '240px' : '40px',
                backgroundColor: theme === 'dark' ? '#0d1117' : '#ffffff',
                color: theme === 'dark' ? '#e6edf3' : '#1f2328',
                border: `1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}`,
              }}
              aria-label="Search repositories"
            />
            <Search className="w-4 h-4 absolute left-2.5 pointer-events-none"
              style={{ color: theme === 'dark' ? '#7d8590' : '#656d76' }} />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="absolute right-2 p-0.5 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" style={{ color: theme === 'dark' ? '#7d8590' : '#656d76' }} />
              </button>
            )}
          </div>

          {/* 主题切换 */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" style={{ color: '#656d76' }} />
            ) : (
              <Sun className="w-4 h-4" style={{ color: '#e3b341' }} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
