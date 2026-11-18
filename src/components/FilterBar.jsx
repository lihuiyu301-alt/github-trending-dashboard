import { AI_CATEGORIES, AI_MODES } from '../config/aiCategories';
import { LANGUAGES } from '../config/languages';
import t from '../i18n/zh-CN';

const LANGUAGE_OPTIONS = [
  { label: t.filter.all, value: '' },
  ...LANGUAGES,
];

const DATE_RANGES = [
  { label: t.filter.today, value: 'today' },
  { label: t.filter.week, value: 'week' },
  { label: t.filter.month, value: 'month' },
];

const SORT_OPTIONS = [
  { label: t.filter.sortTrending, value: 'trending' },
  { label: t.filter.sortStars, value: 'stars' },
  { label: t.filter.sortForks, value: 'forks' },
  { label: t.filter.sortUpdated, value: 'updated' },
];

/**
 * 筛选栏组件
 * 支持 AI 细分赛道、榜单模式、时间周期、编程语言、排序方式与合集过滤切换
 */
export function FilterBar({
  category = 'all',
  onCategoryChange,
  mode = 'trending',
  onModeChange,
  language,
  onLanguageChange,
  dateRange,
  onDateRangeChange,
  sort = 'trending',
  onSortChange,
  hideCollections = true,
  onHideCollectionsChange,
  theme,
}) {
  const isDark = theme === 'dark';

  const pillStyle = (isActive) => ({
    backgroundColor: isActive
      ? (isDark ? '#21262d' : '#e8ecf0')
      : 'transparent',
    color: isActive
      ? (isDark ? '#e6edf3' : '#1f2328')
      : (isDark ? '#7d8590' : '#656d76'),
    border: isActive
      ? `1px solid ${isDark ? '#30363d' : '#d0d7de'}`
      : '1px solid transparent',
  });

  const selectStyle = {
    backgroundColor: isDark ? '#0d1117' : '#ffffff',
    color: isDark ? '#e6edf3' : '#1f2328',
    border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
  };

  return (
    <div
      className="sticky top-16 z-40 border-b py-3"
      style={{
        backgroundColor: isDark ? 'rgba(13,17,23,0.95)' : 'rgba(246,248,250,0.95)',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col gap-2.5">
        {/* 第一行：AI 细分赛道 */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide"
          role="group"
          aria-label="选择 AI 细分赛道"
        >
          {AI_CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className="px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-all cursor-pointer"
                style={pillStyle(isActive)}
                title={cat.description}
                aria-pressed={isActive}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 第二行：榜单模式 + 时间周期 + 语言 + 排序 + 过滤合集 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 榜单模式 */}
          <div className="flex items-center gap-1" role="group" aria-label="选择榜单模式">
            {AI_MODES.map((m) => {
              const isActive = mode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => onModeChange(m.value)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer"
                  style={pillStyle(isActive)}
                  aria-pressed={isActive}
                >
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-4 mx-1" style={{ backgroundColor: isDark ? '#30363d' : '#d0d7de' }} />

          {/* 时间周期 */}
          <div className="flex items-center gap-1" role="group" aria-label={t.a11y.selectRange}>
            {DATE_RANGES.map((range) => {
              const isActive = dateRange === range.value;
              return (
                <button
                  key={range.value}
                  onClick={() => onDateRangeChange(range.value)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer"
                  style={pillStyle(isActive)}
                  aria-pressed={isActive}
                >
                  {range.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block w-px h-4 mx-1" style={{ backgroundColor: isDark ? '#30363d' : '#d0d7de' }} />

          {/* 语言下拉 */}
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label={t.a11y.selectLang}
            className="px-2.5 py-1 rounded-md text-xs font-medium outline-none cursor-pointer"
            style={selectStyle}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value || 'all'} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* 排序方式 */}
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="选择排序方式"
            className="px-2.5 py-1 rounded-md text-xs font-medium outline-none cursor-pointer"
            style={selectStyle}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* 过滤合集开关 */}
          <button
            onClick={() => onHideCollectionsChange(!hideCollections)}
            className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ml-auto sm:ml-0"
            style={{
              backgroundColor: hideCollections
                ? (isDark ? 'rgba(56,139,253,0.15)' : '#ddf4ff')
                : 'transparent',
              color: hideCollections
                ? (isDark ? '#58a6ff' : '#0969da')
                : (isDark ? '#7d8590' : '#656d76'),
              border: `1px solid ${hideCollections
                ? (isDark ? 'rgba(56,139,253,0.4)' : '#54aeff')
                : (isDark ? '#30363d' : '#d0d7de')}`,
            }}
            aria-pressed={hideCollections}
            title="隐藏 awesome-* 等纯资料合集，聚焦开源工具与模型项目"
          >
            {hideCollections ? `✓ ${t.filter.hideCollections}` : t.filter.hideCollections}
          </button>
        </div>
      </div>
    </div>
  );
}
