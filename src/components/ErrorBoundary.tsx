import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Intentionally silent in production UI; never leak stack traces to end users.
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1220] px-4"
        >
          <div className="max-w-md w-full bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-6 text-center space-y-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/70 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                ScamShield encountered an unexpected interface error. Your saved session history is
                unaffected—reload the workspace to continue.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Reload ScamShield</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
