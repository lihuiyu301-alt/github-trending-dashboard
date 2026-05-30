import { RepoCard } from './RepoCard';
import { SkeletonLoader } from './SkeletonLoader';
import { EmptyState } from './EmptyState';

/**
 * 仓库列表容器
 * 管理卡片网格渲染、加载状态、错误状态
 * @param {Object} props
 * @param {Array} props.repos - 仓库数据数组
 * @param {boolean} props.loading - 是否加载中
 * @param {Object|null} props.error - 错误信息
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {(repo: Object) => void} props.onToggleBookmark - 收藏切换
 * @param {(id: number) => boolean} props.isBookmarked - 是否已收藏
 * @param {() => void} props.onRetry - 重试回调
 * @param {boolean} props.hasMore - 是否有更多数据
 * @param {() => void} props.onLoadMore - 加载更多
 */
export function RepoList({ repos, loading, error, theme, onToggleBookmark, isBookmarked, onRetry, hasMore, onLoadMore }) {
  // 错误状态
  if (error && repos.length === 0) {
    const errorType = error.code === 'RATE_LIMIT' ? 'rate_limit' : 'network';
    return <EmptyState type={errorType} theme={theme} onRetry={onRetry} />;
  }

  // 首次加载骨架屏
  if (loading && repos.length === 0) {
    return <SkeletonLoader theme={theme} />;
  }

  // 空结果
  if (!loading && repos.length === 0) {
    return <EmptyState type="empty" theme={theme} />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            isBookmarked={isBookmarked(repo.id)}
            onToggleBookmark={onToggleBookmark}
            theme={theme}
          />
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2.5 rounded-md text-sm font-medium transition-colors"
            style={{
              backgroundColor: theme === 'dark' ? '#21262d' : '#e8ecf0',
              color: theme === 'dark' ? '#e6edf3' : '#1f2328',
              border: `1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}`,
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
