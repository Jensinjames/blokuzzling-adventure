
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleSignOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    window.location.href = '/#/auth';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Check if the error is auth-related
      const isAuthError = this.state.error?.message?.toLowerCase().includes('auth') || 
                          this.state.error?.message?.toLowerCase().includes('token') ||
                          this.state.error?.message?.toLowerCase().includes('session');

      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-center mb-4">Something went wrong</h1>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="flex flex-col space-y-2">
              <Button onClick={this.handleReload} className="w-full">
                Reload Page
              </Button>
              {isAuthError && (
                <Button onClick={this.handleSignOut} variant="outline" className="w-full">
                  Sign Out and Sign In Again
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
