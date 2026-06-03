import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Catches render errors. With `fallback`, renders it instead of the error UI
 *  (used to fall back from the 3D surface to the 2D one). */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode; label?: string },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visible in the console for diagnostics.
    console.error(`App error [${this.props.label ?? "root"}]:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback !== undefined) return this.props.fallback;
      return (
        <div className="app-error">
          <h2>Es ist ein Fehler aufgetreten</h2>
          <pre>{this.state.error.message}</pre>
          <pre className="app-error-stack">{this.state.error.stack}</pre>
          <button onClick={() => location.reload()}>Neu laden</button>
        </div>
      );
    }
    return this.props.children;
  }
}
