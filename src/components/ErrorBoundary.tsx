import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#000", padding: "2rem", zIndex: 9999}}>
          <div style={{maxWidth: "400px", width: "100%", background: "white", padding: "2rem", borderRadius: "2rem", boxShadow: "0 0 20px rgba(0,0,0,0.1)", textAlign: "center"}}>
            <h1 style={{fontSize: "1.5rem", fontWeight: "bold", color: "red", margin: "0 0 1rem 0"}}>System Error</h1>
            <p style={{fontSize: "0.875rem", color: "#333", margin: "0 0 2rem 0", wordBreak: "break-word"}}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{padding: "0.75rem 1.5rem", background: "red", color: "white", border: "none", borderRadius: "1rem", fontWeight: "bold", cursor: "pointer", width: "100%"}}
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
