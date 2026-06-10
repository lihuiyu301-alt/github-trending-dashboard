import { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * 回到顶部按钮
 * 滚动超过 400px 后显示，点击平滑滚动回顶部
 * @param {Object} props
 * @param {'light'|'dark'} props.theme - 当前主题
 */
export function BackToTop({ theme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      style={{
        backgroundColor: theme === 'dark' ? '#21262d' : '#ffffff',
        color: theme === 'dark' ? '#e6edf3' : '#1f2328',
        border: `1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'}`,
      }}
      aria-label="回到顶部"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
