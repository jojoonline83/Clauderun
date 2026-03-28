import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-orange-50">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-xl font-black text-gray-800 mb-2">哎呀，出错了！</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Something went wrong. Please refresh the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-400 text-white font-black px-6 py-3 rounded-2xl"
          >
            重新加载 🔄
          </button>
          {this.state.error && (
            <p className="text-xs text-gray-400 mt-4 text-center max-w-xs break-all">
              {this.state.error.message}
            </p>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
