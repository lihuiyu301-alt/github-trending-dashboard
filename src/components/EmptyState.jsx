import { AlertTriangle, Search, WifiOff } from 'lucide-react';
import t from '../i18n/zh-CN';

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
            {t.error.rateLimitTitle}
          </h3>
          <p className="text-sm mb-4" style={{ color: subTextColor }}>
            {t.error.rateLimitDesc}
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
                {t.error.retry}
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
              {t.error.learnMore}
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
            {t.error.networkTitle}
          </h3>
          <p className="text-sm mb-4" style={{ color: subTextColor }}>
            {t.error.networkDesc}
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
              {t.error.reload}
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
        {t.error.emptyTitle}
      </h3>
      <p className="text-sm" style={{ color: subTextColor }}>
        {t.error.emptyDesc}
      </p>
    </div>
  );
}
