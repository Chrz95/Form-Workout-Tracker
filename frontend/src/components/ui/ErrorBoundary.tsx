import { reportRenderingFailure } from "../../lib/logger/logger";
import { Component, type ErrorInfo, type ReactNode } from "react";
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
/** Preserves a usable recovery screen for unexpected rendering errors. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state = { hasError: false };
  /** Maps unexpected render failures into a recovery state.
   * @returns {ErrorBoundaryState} Safe fallback state.
   */
  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }
  /** Keeps technical failure details out of product flows.
   * @param {Error} error - Rendering failure.
   * @param {ErrorInfo} information - React diagnostic metadata.
   */
  override componentDidCatch(error: Error, information: ErrorInfo) {
    reportRenderingFailure(error);
    void information;
  }
  /** Offers a reload without exposing internal errors.
   * @returns {ReactNode} Children or recovery screen.
   */
  override render(): ReactNode {
    const { children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return (
        <main className="onboarding-empty">
          <h1>Let’s get you moving again.</h1>
          <p>Something interrupted this screen. Reload to restart the studio.</p>
          <button
            className="button primary"
            onClick={() => location.reload()}
          >
            Reload Form
          </button>
        </main>
      );
    }
    return children;
  }
}
