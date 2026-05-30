/**
 * 单个骨架卡片组件
 * 精确模拟 RepoCard 的布局结构，带 shimmer 动效
 * @param {Object} props
 * @param {'light'|'dark'} props.theme - 当前主题
 */
export function SkeletonCard({ theme }) {
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-lg p-4 border"
      style={{
        backgroundColor: isDark ? '#161b22' : '#ffffff',
        borderColor: isDark ? '#30363d' : '#d0d7de',
      }}
    >
      {/* 头像 + 标题占位 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full skeleton-shimmer shrink-0" />
        <div className="flex-1">
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
        </div>
        <div className="w-8 h-8 rounded-md skeleton-shimmer" />
      </div>

      {/* 描述行 */}
      <div className="space-y-2 mb-4">
        <div className="h-3.5 w-full rounded skeleton-shimmer" />
        <div className="h-3.5 w-2/3 rounded skeleton-shimmer" />
      </div>

      {/* 底部统计占位 */}
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-16 rounded skeleton-shimmer" />
        <div className="h-3.5 w-14 rounded skeleton-shimmer" />
        <div className="h-3.5 w-14 rounded skeleton-shimmer" />
      </div>
    </div>
  );
}
