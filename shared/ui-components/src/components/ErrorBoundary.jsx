import React from 'react';
import PropTypes from 'prop-types';

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
        <div className="p-8 max-w-lg mx-auto my-8 bg-rose-50/80 border border-rose-200 rounded-2xl text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto text-xl font-bold">
            ⚠️
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
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
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
