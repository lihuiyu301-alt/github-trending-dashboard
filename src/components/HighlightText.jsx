/**
 * 搜索关键词高亮组件
 * 将文本中匹配的关键词部分用高亮样式标记
 * @param {Object} props
 * @param {string} props.text - 原始文本
 * @param {string} props.keyword - 搜索关键词
 * @param {string} props.highlightColor - 高亮背景色
 */
export function HighlightText({ text, keyword, highlightColor = '#fff3bf' }) {
  if (!text || !keyword) return text || '';

  // 转义正则特殊字符
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} style={{ backgroundColor: highlightColor, borderRadius: '2px', padding: '0 1px' }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}
