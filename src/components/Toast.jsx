import { memo } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: { bg: '#1a7f37', text: '#ffffff' },
  error: { bg: '#cf222e', text: '#ffffff' },
  info: { bg: '#0969da', text: '#ffffff' },
};

/**
 * 单条 Toast 提示
 * @param {Object} props
 * @param {string} props.message - 提示文本
 * @param {'success'|'error'|'info'} props.type - 类型
 * @param {() => void} props.onClose - 关闭回调
 * @param {'light'|'dark'} props.theme - 当前主题
 */
const ToastItem = memo(function ToastItem({ message, type = 'info', onClose, theme }) {
  const Icon = ICONS[type] || ICONS.info;
  const colors = COLORS[type] || COLORS.info;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-slide-in"
      style={{
        backgroundColor: theme === 'dark' ? '#161b22' : colors.bg,
        color: theme === 'dark' ? '#e6edf3' : colors.text,
        border: `1px solid ${theme === 'dark' ? '#30363d' : 'transparent'}`,
      }}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: theme === 'dark' ? '#3fb950' : undefined }} />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded hover:opacity-70 transition-opacity"
        aria-label="关闭"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

/**
 * Toast 容器
 * 固定在页面右上角，展示所有 Toast 提示
 * @param {Object} props
 * @param {Array} props.toasts - Toast 列表
 * @param {(id: number) => void} props.onRemove - 移除 Toast
 * @param {'light'|'dark'} props.theme - 当前主题
 */
export function ToastContainer({ toasts, onRemove, theme }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            message={toast.message}
            type={toast.type}
            theme={theme}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
