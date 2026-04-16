import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[100dvh] bg-background flex flex-col items-center justify-center px-4 overflow-auto">
          <div className="text-center space-y-4 max-w-md py-8">
            <h1 className="text-2xl font-bold text-foreground">Oops! Algo correu mal</h1>
            <p className="text-muted-foreground">
              Desculpa, ocorreu um erro inesperado. Por favor, recarrega a página ou contacta o suporte.
            </p>
            {this.state.error && (
              <details className="text-left bg-muted/50 p-3 rounded-lg text-xs text-muted-foreground overflow-auto max-h-32">
                <summary className="cursor-pointer font-semibold mb-2">Detalhes do erro</summary>
                <code className="block break-words whitespace-pre-wrap">{this.state.error.toString()}</code>
              </details>
            )}
            <div className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
