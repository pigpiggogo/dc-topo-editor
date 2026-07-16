import { Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: unknown }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error }
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#b91c1c',
            color: 'white',
            padding: '40px',
            fontFamily: 'monospace',
            zIndex: 99999,
            overflow: 'auto',
          }}
        >
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>React Render Error</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {String(this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="color:red;padding:20px;font-size:18px">ERROR: root element not found</div>'
} else {
  createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>,
  )
}
