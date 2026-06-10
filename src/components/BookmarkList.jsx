import { useRef } from 'react';
import { RepoCard } from './RepoCard';
import { Bookmark, Download, Upload } from 'lucide-react';
import t from '../i18n/zh-CN';

/**
 * 收藏夹页面组件
 * 展示已收藏的仓库列表，支持导出/导入
 * @param {Object} props
 * @param {Array} props.bookmarks - 已收藏仓库数组
 * @param {'light'|'dark'} props.theme - 当前主题
 * @param {(repo: Object) => void} props.onToggleBookmark - 收藏切换
 * @param {(id: number) => boolean} props.isBookmarked - 是否已收藏
 * @param {() => void} props.onClearAll - 清空所有收藏
 * @param {() => void} props.onExport - 导出收藏
 * @param {(json: string) => { success: boolean, count: number, error?: string }} props.onImport - 导入收藏
 * @param {(message: string, type?: string) => void} props.showToast - Toast 提示
 */
export function BookmarkList({ bookmarks, theme, onToggleBookmark, isBookmarked, onClearAll, onExport, onImport, showToast }) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e6edf3' : '#1f2328';
  const subTextColor = isDark ? '#7d8590' : '#656d76';
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = onImport(event.target.result);
      if (result.success) {
        showToast(`成功导入 ${result.count} 个新收藏`, 'success');
      } else {
        showToast(result.error, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Bookmark className="w-16 h-16 mb-4" style={{ color: isDark ? '#30363d' : '#d0d7de' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: textColor }}>
          {t.bookmark.emptyTitle}
        </h3>
        <p className="text-sm mb-4" style={{ color: subTextColor }}>
          {t.bookmark.emptyDesc}
        </p>
        {/* 空状态也显示导入按钮 */}
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors"
          style={{
            color: isDark ? '#58a6ff' : '#0969da',
            border: `1px solid ${isDark ? '#30363d' : '#d0d7de'}`,
          }}
        >
          <Upload className="w-3.5 h-3.5" />
          {t.bookmark.importBtn}
        </button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
      </div>
    );
  }

  return (
    <div>
      {/* 头部信息 */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: subTextColor }}>
          {t.bookmark.count.replace('{n}', bookmarks.length)}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: isDark ? '#58a6ff' : '#0969da',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(88,166,255,0.1)' : 'rgba(9,105,218,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Download className="w-3.5 h-3.5" />
            {t.bookmark.exportBtn}
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors"
            style={{
              color: isDark ? '#58a6ff' : '#0969da',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(88,166,255,0.1)' : 'rgba(9,105,218,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            {t.bookmark.importBtn}
          </button>
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
            {t.bookmark.clearAll}
          </button>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />

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
