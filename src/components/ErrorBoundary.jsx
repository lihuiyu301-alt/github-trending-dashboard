import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * 错误边界组件
 * 捕获组件树内的意外 JS 错误，展示友好的 Fallback UI
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8"
          style={{ backgroundColor: '#0d1117' }}>
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: '#e3b341' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#e6edf3' }}>
              出现了一些问题
            </h2>
            <p className="text-sm mb-6" style={{ color: '#7d8590' }}>
              应用遇到了意外错误，请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-md text-sm font-medium"
              style={{
                backgroundColor: '#238636',
                color: '#ffffff',
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
