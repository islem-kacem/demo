import { Component } from 'react';

export class ErrorBoundary extends Component {
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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#f8d7da', color: '#721c24' }}>
          <h2>Something went wrong</h2>
          <p>The application encountered an unexpected error.</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              <summary>Error details</summary>
              {this.state.error.toString()}
            </details>
          )}
          {this.state.errorInfo && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>
              <summary>Component stack</summary>
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
