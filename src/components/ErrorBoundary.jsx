import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('Error caught by boundary:', error, errorInfo);

        // You could send this to an error tracking service like Sentry here
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleRefresh = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
                    <div className="card max-w-lg text-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">
                            Oops! Something went wrong
                        </h2>

                        <p className="text-text-secondary mb-6">
                            We're sorry for the inconvenience. An unexpected error occurred.
                            Please try refreshing the page or returning to the home page.
                        </p>

                        {/* Error details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
                                <p className="text-xs text-red-400 font-mono break-all">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-red-400 cursor-pointer">
                                            Stack trace
                                        </summary>
                                        <pre className="text-[10px] text-red-400/70 mt-2 overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRefresh}
                                className="btn-primary flex items-center gap-2"
                            >
                                <RefreshCcw size={18} />
                                Refresh Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>

                        <p className="text-xs text-text-secondary mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
