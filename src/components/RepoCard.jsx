import { useState, useCallback, memo } from 'react';
import { Star, GitFork, Bookmark, Languages, Loader2 } from 'lucide-react';
import { formatNumber } from '../utils/githubApi';
import { getLanguageColor } from '../utils/languageColors';
import { useTranslate } from '../hooks/useTranslate';
import { HighlightText } from './HighlightText';
import t from '../i18n/zh-CN';

/**
 * 单个仓库卡片组件
 * 使用 React.memo 避免父组件重渲染导致的无效更新
 * @param {Object} props
 * @param {Object} props.repo - GitHub 仓库数据
 * @param {boolean} props.isBookmarked - 是否已收藏
 * @param {(repo: Object) => void} props.onToggleBookmark - 收藏切换回调
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {string} [props.keyword] - 搜索关键词（用于高亮）
 */
export const RepoCard = memo(function RepoCard({ repo, isBookmarked, onToggleBookmark, theme, keyword }) {
  const [bouncing, setBouncing] = useState(false);
  const isDark = theme === 'dark';

  const description = repo.description || '';
  const { translated, loading: translating, error: translateError, translate, showOriginal, isTranslated } = useTranslate(description);

  const handleBookmarkClick = useCallback((e) => {
    e.stopPropagation();
    setBouncing(true);
    onToggleBookmark(repo);
    setTimeout(() => setBouncing(false), 300);
  }, [repo, onToggleBookmark]);

  const handleCardClick = useCallback(() => {
    window.open(repo.html_url, '_blank', 'noopener,noreferrer');
  }, [repo.html_url]);

  const owner = repo.owner?.login || '—';
  const name = repo.name || '—';
  const language = repo.language || null;
  const stars = repo.stargazers_count;
  const forks = repo.forks_count;
  const topics = repo.topics || [];
  const avatarUrl = repo.owner?.avatar_url || `https://github.com/${owner}.png?size=40`;

  const displayDescription = isTranslated ? translated : description;

  return (
    <article
      className="rounded-lg border cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: isDark ? '#161b22' : '#ffffff',
        borderColor: isDark ? '#30363d' : '#d0d7de',
        boxShadow: isDark
          ? '0 1px 3px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 12px rgba(0,0,0,0.5)'
          : '0 4px 12px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = isDark
          ? '0 1px 3px rgba(0,0,0,0.4)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)';
      }}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
    >
      <div className="p-4">
        {/* 头部：头像 + 仓库名 + 收藏按钮 */}
        <div className="flex items-start gap-3 mb-3">
          <img
            src={avatarUrl}
            alt={t.card.avatarAlt.replace('{owner}', owner)}
            width={40}
            height={40}
            loading="lazy"
            className="rounded-full shrink-0"
            style={{ backgroundColor: isDark ? '#21262d' : '#f0f3f6' }}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${owner}&size=40&background=e8ecf0&color=1f2328`;
            }}
          />
          <div className="flex-1 min-w-0">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold hover:underline block truncate"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: isDark ? '#58a6ff' : '#0969da',
                fontSize: '15px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {keyword ? <HighlightText text={`${owner} / ${name}`} keyword={keyword} /> : `${owner} / ${name}`}
            </a>
          </div>
          <button
            onClick={handleBookmarkClick}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${bouncing ? 'bookmark-bounce' : ''}`}
            style={{
              color: isBookmarked ? '#e3b341' : (isDark ? '#7d8590' : '#656d76'),
            }}
            aria-label={(isBookmarked ? t.bookmark.removeFrom : t.bookmark.addTo).replace('{name}', `${owner}/${name}`)}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? '#e3b341' : 'none'}
            />
          </button>
        </div>

        {/* 描述 + 翻译按钮 */}
        {description && (
          <div className="mb-3">
            <p
              className="text-sm line-clamp-2 leading-relaxed"
              style={{ color: isDark ? '#7d8590' : '#656d76' }}
              title={displayDescription}
            >
              {keyword && !isTranslated
                ? <HighlightText text={displayDescription} keyword={keyword} highlightColor={isDark ? '#3b2e00' : '#fff3bf'} />
                : displayDescription}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {isTranslated ? (
                <button
                  onClick={(e) => { e.stopPropagation(); showOriginal(); }}
                  className="flex items-center gap-1 text-xs hover:underline transition-colors"
                  style={{ color: isDark ? '#58a6ff' : '#0969da' }}
                >
                  <Languages className="w-3 h-3" />
                  {t.translate.showOriginal}
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); translate(); }}
                  className="flex items-center gap-1 text-xs hover:underline transition-colors"
                  style={{ color: isDark ? '#7d8590' : '#656d76' }}
                  disabled={translating}
                >
                  {translating ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t.translate.translating}
                    </>
                  ) : (
                    <>
                      <Languages className="w-3 h-3" />
                      {t.translate.button}
                    </>
                  )}
                </button>
              )}
              {translateError && (
                <span className="text-xs" style={{ color: isDark ? '#f85149' : '#cf222e' }}>
                  {t.translate.error}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 底部：语言 + Stars + Forks */}
        <div className="flex items-center gap-3 flex-wrap">
          {language && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? '#7d8590' : '#656d76' }}>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getLanguageColor(language) }}
              />
              {language}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs"
            style={{ color: isDark ? '#7d8590' : '#656d76', fontFamily: "'JetBrains Mono', monospace" }}>
            <Star className="w-3.5 h-3.5" />
            {formatNumber(stars)}
          </span>
          <span className="flex items-center gap-1 text-xs"
            style={{ color: isDark ? '#7d8590' : '#656d76', fontFamily: "'JetBrains Mono', monospace" }}>
            <GitFork className="w-3.5 h-3.5" />
            {formatNumber(forks)}
          </span>
        </div>

        {/* Topics 标签 */}
        {topics.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: isDark ? '#21262d' : '#e8ecf0',
                  color: isDark ? '#58a6ff' : '#0969da',
                }}
              >
                {topic}
              </span>
            ))}
            {topics.length > 3 && (
              <span className="text-xs" style={{ color: isDark ? '#7d8590' : '#656d76' }}>
                {t.card.more.replace('{n}', topics.length - 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
