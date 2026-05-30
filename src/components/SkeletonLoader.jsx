import { SkeletonCard } from './SkeletonCard';

/**
 * 骨架屏加载器
 * 渲染 8 个骨架卡片占位
 * @param {Object} props
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {number} [props.count=8] - 骨架卡片数量
 */
export function SkeletonLoader({ theme, count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} theme={theme} />
      ))}
    </div>
  );
}
