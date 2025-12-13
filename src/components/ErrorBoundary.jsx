import React from 'react'
import PropTypes from 'prop-types'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px',
            backgroundColor: '#f8f6f1',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
            }}
          >
            <h1 style={{ color: '#dc2626', fontSize: '24px', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
              The game encountered an unexpected error. You can try reloading the page or resetting the game.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ overflow: 'auto', fontSize: '12px', color: '#dc2626' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#fff',
                  fontWeight: 'bold',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
              {this.props.onReset && (
                <button
                  onClick={this.handleReset}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
}

export default ErrorBoundary
