import { getLanguageColor } from '../utils/languageColors';

/** 必选语言列表 */
const LANGUAGES = [
  { label: 'All', value: '' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'Swift', value: 'swift' },
];

/** 时间周期列表 */
const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
];

/**
 * 筛选栏组件
 * 支持语言和时间周期切换，sticky 吸顶
 * @param {Object} props
 * @param {string} props.language - 当前语言筛选
 * @param {(lang: string) => void} props.onLanguageChange - 语言切换回调
 * @param {'today'|'week'|'month'} props.dateRange - 当前时间范围
 * @param {(range: string) => void} props.onDateRangeChange - 时间范围切换回调
 * @param {'light'|'dark'} props.theme - 当前主题
 */
export function FilterBar({ language, onLanguageChange, dateRange, onDateRangeChange, theme }) {
  const isDark = theme === 'dark';

  return (
    <div className="sticky top-16 z-40 border-b py-3"
      style={{
        backgroundColor: isDark ? 'rgba(13,17,23,0.95)' : 'rgba(246,248,250,0.95)',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        backdropFilter: 'blur(8px)',
      }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* 语言筛选 */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
          role="group"
          aria-label="Select programming language"
        >
          {LANGUAGES.map((lang) => {
            const isActive = language === lang.value;
            const color = lang.value ? getLanguageColor(lang.label) : null;
            return (
              <button
                key={lang.value}
                onClick={() => onLanguageChange(lang.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive
                    ? (isDark ? '#21262d' : '#e8ecf0')
                    : 'transparent',
                  color: isActive
                    ? (isDark ? '#e6edf3' : '#1f2328')
                    : (isDark ? '#7d8590' : '#656d76'),
                  border: isActive
                    ? `1px solid ${isDark ? '#30363d' : '#d0d7de'}`
                    : '1px solid transparent',
                }}
                aria-pressed={isActive}
              >
                {color && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
                {lang.label}
              </button>
            );
          })}
        </div>

        {/* 分隔线 */}
        <div className="hidden sm:block w-px h-5 mx-2" style={{ backgroundColor: isDark ? '#30363d' : '#d0d7de' }} />

        {/* 时间周期筛选 */}
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Select time range"
        >
          {DATE_RANGES.map((range) => {
            const isActive = dateRange === range.value;
            return (
              <button
                key={range.value}
                onClick={() => onDateRangeChange(range.value)}
                className="px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all"
                style={{
                  backgroundColor: isActive
                    ? (isDark ? '#21262d' : '#e8ecf0')
                    : 'transparent',
                  color: isActive
                    ? (isDark ? '#e6edf3' : '#1f2328')
                    : (isDark ? '#7d8590' : '#656d76'),
                  border: isActive
                    ? `1px solid ${isDark ? '#30363d' : '#d0d7de'}`
                    : '1px solid transparent',
                }}
                aria-pressed={isActive}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
