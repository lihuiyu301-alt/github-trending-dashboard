import { memo } from 'react';
import { Flame, Trophy, Activity, Star, Bookmark, RefreshCw, Mail } from 'lucide-react';
import { formatNumber } from '../utils/githubApi';
import { getLanguageColor } from '../utils/languageColors';
import { LANGUAGES } from '../config/languages';
import t from '../i18n/zh-CN';

const COLUMNS = [
  {
    key: 'weekly',
    title: t.recommendation.weeklyNew,
    description: t.recommendation.weeklyNewDesc,
    icon: Flame,
    lightColor: '#cf222e',
    darkColor: '#f85149',
  },
  {
    key: 'hallOfFame',
    title: t.recommendation.hallOfFame,
    description: t.recommendation.hallOfFameDesc,
    icon: Trophy,
    lightColor: '#9a6700',
    darkColor: '#e3b341',
  },
  {
    key: 'active',
    title: t.recommendation.active,
    description: t.recommendation.activeDesc,
    icon: Activity,
    lightColor: '#1a7f37',
    darkColor: '#3fb950',
  },
];

function SkeletonRows() {
  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-start gap-2 px-1.5 py-2">
          <div className="skeleton-shimmer w-5 h-5 rounded-md shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="skeleton-shimmer h-3 rounded w-3/4 mb-1.5" />
            <div className="skeleton-shimmer h-2.5 rounded w-full mb-1.5" />
            <div className="skeleton-shimmer h-2.5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ color, onRetry }) {
  return (
    <div className="flex items-center gap-2 px-1.5 py-3 text-xs" style={{ color }}>
      <span>{t.recommendation.error}</span>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1 hover:underline"
        style={{ color }}
      >
        <RefreshCw className="w-3 h-3" />
        {t.recommendation.retry}
      </button>
    </div>
  );
}

function EmptyBlock({ color }) {
  return (
    <p className="px-1.5 py-3 text-xs" style={{ color }}>
      {t.recommendation.empty}
    </p>
  );
}

function RepoRow({ repo, rank, theme, onToggleBookmark, isBookmarked }) {
  const isDark = theme === 'dark';
  const owner = repo.owner?.login || '—';
  const name = repo.name || '—';
  const description = repo.description || '';
  const language = repo.language || null;
  const bookmarked = isBookmarked(repo.id);
  const subColor = isDark ? '#7d8590' : '#656d76';

  return (
    <div
      className="flex items-start gap-2 rounded-md px-1.5 py-2 transition-colors"
      onMouseEnter={(event) => {
        event.currentTarget.style.backgroundColor = isDark ? '#21262d' : '#f6f8fa';
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <span
        className="flex items-center justify-center w-5 h-5 rounded-md text-xs shrink-0"
        style={{
          backgroundColor: isDark ? '#21262d' : '#eef2f6',
          color: rank <= 3 ? (isDark ? '#e3b341' : '#9a6700') : subColor,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <a
          href={repo.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate text-xs font-semibold hover:underline"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: isDark ? '#58a6ff' : '#0969da',
          }}
          title={`${owner}/${name}`}
        >
          {owner}/{name}
        </a>
        {description && (
          <p className="text-xs truncate mt-0.5" style={{ color: subColor }} title={description}>
            {description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: subColor }}>
          <span className="flex items-center gap-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <Star className="w-3 h-3" />
            {formatNumber(repo.stargazers_count)}
          </span>
          {language && (
            <span className="flex items-center gap-1 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getLanguageColor(language) }} />
              <span className="truncate">{language}</span>
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggleBookmark(repo);
        }}
        className="p-1 rounded-md shrink-0 transition-colors"
        style={{ color: bookmarked ? '#e3b341' : subColor }}
        aria-label={(bookmarked ? t.bookmark.removeFrom : t.bookmark.addTo).replace('{name}', `${owner}/${name}`)}
      >
        <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? '#e3b341' : 'none'} />
      </button>
    </div>
  );
}

function RecommendationColumn({ column, items, loading, failed, theme, onRetry, onToggleBookmark, isBookmarked }) {
  const isDark = theme === 'dark';
  const Icon = column.icon;
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const subColor = isDark ? '#7d8590' : '#656d76';
  const dangerColor = isDark ? '#f85149' : '#cf222e';

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 px-1.5">
        <Icon className="w-4 h-4" style={{ color: isDark ? column.darkColor : column.lightColor }} />
        <h3 className="text-sm font-semibold" style={{ color: textColor }}>
          {column.title}
        </h3>
      </div>
      <p className="text-xs mt-1 mb-2 px-1.5" style={{ color: subColor }}>
        {column.description}
      </p>
      <div className="border-t pt-1" style={{ borderColor: isDark ? '#30363d' : '#d0d7de' }}>
        {loading ? (
          <SkeletonRows />
        ) : failed ? (
          <ErrorBlock color={dangerColor} onRetry={onRetry} />
        ) : items.length === 0 ? (
          <EmptyBlock color={subColor} />
        ) : (
          items.map((repo, index) => (
            <RepoRow
              key={repo.id}
              repo={repo}
              rank={index + 1}
              theme={theme}
              onToggleBookmark={onToggleBookmark}
              isBookmarked={isBookmarked}
            />
          ))
        )}
      </div>
    </div>
  );
}

export const RecommendationBoard = memo(function RecommendationBoard({
  data,
  loading,
  error,
  failedTypes = [],
  onRetry,
  theme,
  language,
  onToggleBookmark,
  isBookmarked,
}) {
  const isDark = theme === 'dark';
  const subColor = isDark ? '#7d8590' : '#656d76';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const languageLabel = LANGUAGES.find((item) => item.value === language)?.label || t.filter.all;

  return (
    <section
      className="rounded-lg border mb-6 overflow-hidden"
      style={{
        backgroundColor: isDark ? '#161b22' : '#ffffff',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        boxShadow: isDark
          ? '0 1px 3px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }}
      aria-label={t.recommendation.title}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b"
        style={{ borderColor: isDark ? '#30363d' : '#d0d7de' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md shrink-0"
            style={{ backgroundColor: isDark ? '#21262d' : '#eef2f6' }}
          >
            <Flame className="w-4 h-4" style={{ color: isDark ? '#f85149' : '#cf222e' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold" style={{ color: textColor }}>
                {t.recommendation.title}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: isDark ? '#21262d' : '#eef2f6',
                  color: isDark ? '#58a6ff' : '#0969da',
                }}
              >
                {languageLabel}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: subColor }}>
              {t.recommendation.subtitle}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs shrink-0" style={{ color: subColor }}>
          <Mail className="w-3.5 h-3.5" />
          {t.recommendation.digestNote}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {error && !loading ? (
          <div className="flex items-center gap-3 text-sm" style={{ color: isDark ? '#f85149' : '#cf222e' }}>
            <span>{t.recommendation.error}</span>
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
              style={{
                border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
                color: isDark ? '#e6edf3' : '#1f2328',
              }}
            >
              <RefreshCw className="w-3 h-3" />
              {t.recommendation.retry}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {COLUMNS.map((column) => (
              <RecommendationColumn
                key={column.key}
                column={column}
                items={data?.[column.key] || []}
                loading={loading}
                failed={failedTypes.includes(column.key)}
                theme={theme}
                onRetry={onRetry}
                onToggleBookmark={onToggleBookmark}
                isBookmarked={isBookmarked}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
