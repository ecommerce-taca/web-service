import { Component } from 'react';
import PropTypes from 'prop-types';

class RemoteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[RemoteErrorBoundary] Lỗi khi tải Micro-App "${this.props.appName}":`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Tải lại cửa sổ nếu component lazy import bị lỗi mạng vĩnh viễn
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { appName = 'Micro-App' } = this.props;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50/50">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Không thể kết nối tới {appName}
              </h3>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Máy chủ phục vụ phân hệ này có thể đang tạm ngừng hoặc gặp sự cố kết nối mạng. Bạn có thể kiểm tra cổng dịch vụ hoặc tải lại trang.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-[11px] font-mono text-slate-600 break-all max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleRetry}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[13px] shadow-xs transition-colors cursor-pointer"
              >
                Tải lại phân hệ
              </button>
              <a
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[13px] transition-colors no-underline text-center"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

RemoteErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  appName: PropTypes.string,
};

export default RemoteErrorBoundary;
