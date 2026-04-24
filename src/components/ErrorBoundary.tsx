import { Component, type ErrorInfo, type ReactNode } from 'react';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className='app-error' role='alert'>
          <h1 className='app-error__title'>Something went wrong</h1>
          <p className='app-error__body'>
            The application hit an unexpected error. You can try reloading the page. If the problem persists, clear site
            data for this origin.
          </p>
          {this.state.message ? (
            <pre className='app-error__detail' tabIndex={0}>
              {this.state.message}
            </pre>
          ) : null}
          <button className='app-error__action' type='button' onClick={this.handleReload}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
