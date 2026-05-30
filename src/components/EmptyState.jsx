import { AlertTriangle, Search, WifiOff } from 'lucide-react';

/**
 * 空状态/错误状态展示组件
 * @param {Object} props
 * @param {'empty'|'rate_limit'|'network'} props.type - 状态类型
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {() => void} [props.onRetry] - 重试回调
 */
export function EmptyState({ type, theme, onRetry }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const subTextColor = isDark ? '#7d8590' : '#656d76';
  const bgColor = isDark ? '#161b22' : '#ffffff';
  const borderColor = isDark ? '#30363d' : '#d0d7de';

  if (type === 'rate_limit') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-lg border p-8 max-w-md text-center"
          style={{ backgroundColor: bgColor, borderColor }}>
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: '#e3b341' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
            🚦 请求过于频繁
          </h3>
          <p className="text-sm mb-4" style={{ color: subTextColor }}>
            GitHub API 每小时限制 60 次请求。
            <br />
            您可以登录 GitHub 获得更高配额。
          </p>
          <div className="flex items-center justify-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isDark ? '#238636' : '#2da44e',
                  color: '#ffffff',
                }}
              >
                稍后重试
              </button>
            )}
            <a
              href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isDark ? '#21262d' : '#e8ecf0',
                color: isDark ? '#58a6ff' : '#0969da',
              }}
            >
              了解 Rate Limit
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'network') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-lg border p-8 max-w-md text-center"
          style={{ backgroundColor: bgColor, borderColor }}>
          <WifiOff className="w-12 h-12 mx-auto mb-4" style={{ color: subTextColor }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
            网络连接失败
          </h3>
          <p className="text-sm mb-4" style={{ color: subTextColor }}>
            请检查网络连接后重试
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isDark ? '#238636' : '#2da44e',
                color: '#ffffff',
              }}
            >
              重新加载
            </button>
          )}
        </div>
      </div>
    );
  }

  // empty state
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Search className="w-16 h-16 mb-4" style={{ color: isDark ? '#30363d' : '#d0d7de' }} />
      <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
        暂无热门项目
      </h3>
      <p className="text-sm" style={{ color: subTextColor }}>
        该语言/时间段暂无热门项目，试试切换筛选条件
      </p>
    </div>
  );
}
