import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-navy-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-status-error/20 p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-status-error/10 text-status-error rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Something went wrong</h2>
              <p className="text-navy-500 mt-2">The application encountered an unexpected error. Don't worry, your data is safe.</p>
            </div>
            <div className="bg-navy-50 p-4 rounded-xl text-left">
              <p className="text-xs font-mono text-navy-400 break-all">{this.state.error?.message}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.children;
  }
}
