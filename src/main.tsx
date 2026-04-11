import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorInfo: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught:', error.message)
    console.error('[ErrorBoundary] Stack:', error.stack)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', background: '#1a1a2e', color: '#e0e0e0', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff6b6b' }}>🥥 Coconut crashed</h1>
          <h2 style={{ color: '#ffd93d' }}>{this.state.error?.message}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#a8a8a8', marginTop: 20 }}>
            {this.state.error?.stack}
          </pre>
          <h3 style={{ color: '#6bcb77', marginTop: 20 }}>Component Stack:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: '#a8a8a8' }}>
            {this.state.errorInfo?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#4ecdc4', border: 'none', borderRadius: 8, color: '#1a1a2e', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
