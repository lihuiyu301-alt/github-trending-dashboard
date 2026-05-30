import { RepoCard } from './RepoCard';
import { Bookmark } from 'lucide-react';

/**
 * 收藏夹页面组件
 * 展示已收藏的仓库列表
 * @param {Object} props
 * @param {Array} props.bookmarks - 已收藏仓库数组
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {(repo: Object) => void} props.onToggleBookmark - 收藏切换
 * @param {(id: number) => boolean} props.isBookmarked - 是否已收藏
 * @param {() => void} props.onClearAll - 清空所有收藏
 */
export function BookmarkList({ bookmarks, theme, onToggleBookmark, isBookmarked, onClearAll }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const subTextColor = isDark ? '#7d8590' : '#656d76';

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Bookmark className="w-16 h-16 mb-4" style={{ color: isDark ? '#30363d' : '#d0d7de' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
          暂无收藏
        </h3>
        <p className="text-sm" style={{ color: subTextColor }}>
          浏览 Trending 页面，点击卡片右上角的书签图标来收藏项目
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: subTextColor }}>
          共 {bookmarks.length} 个收藏项目
        </p>
        <button
          onClick={onClearAll}
          className="text-sm px-3 py-1.5 rounded-md transition-colors"
          style={{
            color: isDark ? '#f85149' : '#cf222e',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(248,81,73,0.1)' : 'rgba(207,34,46,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Clear All
        </button>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isBookmarked={isBookmarked(repo.id)}
            onToggleBookmark={onToggleBookmark}
            theme={theme}
          />
        ))}
      </div>
    </div>
  );
}
