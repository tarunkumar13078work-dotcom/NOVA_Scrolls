import React from 'react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('NOVA UI crash intercepted by boundary', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-space px-4 text-white">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">NOVA Scrolls</p>
            <h1 className="mt-2 text-2xl font-semibold">Command interface recovered</h1>
            <p className="mt-2 text-sm text-slate-300">
              A rendering issue occurred. Reload to restore the latest synced state.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-4 rounded-xl bg-gradient-to-r from-neon to-aqua px-4 py-2 text-sm font-semibold text-white"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
