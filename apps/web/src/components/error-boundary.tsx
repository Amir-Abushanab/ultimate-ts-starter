import { getAnalytics } from "@ultimate-ts-starter/analytics";
import { Button } from "@ultimate-ts-starter/ui/components/button";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    getAnalytics().captureException(error, {
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error !== null) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md text-center">
            {this.state.error.message}
          </p>
          <Button
            onClick={() => {
              this.setState({ error: null });
            }}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
