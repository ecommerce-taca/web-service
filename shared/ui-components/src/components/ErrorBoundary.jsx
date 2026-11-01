import React from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="mx-auto my-8 max-w-lg space-y-4 rounded-panel border border-taca-sale/20 bg-taca-sale/5 p-8 text-center shadow-brand-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-card bg-taca-sale/10 text-taca-sale">
            <AlertTriangle className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Đã xảy ra sự cố khi tải nội dung
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              {this.props.message || 'Một lỗi không mong muốn đã xảy ra trong thành phần này.'}
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="rounded-control bg-taca-sale px-4 py-2 text-xs font-bold text-white transition-colors shadow-brand hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-taca-sale focus-visible:ring-offset-2"
            >
              Thử lại
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  message: PropTypes.string,
};

ErrorBoundary.defaultProps = {
  fallback: null,
  message: '',
};

export default ErrorBoundary;
