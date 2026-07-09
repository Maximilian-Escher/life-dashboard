import { Component } from 'react'

// Fängt Render-Fehler in der App ab, damit ein Absturz in einem Widget/einer
// View nicht die ganze Seite weiß/leer lässt. Muss eine Klassenkomponente
// sein – getDerivedStateFromError/componentDidCatch gibt es nicht als Hook.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Unerwarteter Fehler in der App:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-bg)] px-4 text-center">
          <p className="text-sm font-medium text-white">Etwas ist schiefgelaufen.</p>
          <p className="max-w-sm text-xs text-zinc-500">
            Die Seite konnte nicht geladen werden. Das kann an einer instabilen Verbindung liegen – ein Neuladen
            hilft meistens.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-1 rounded-lg bg-[var(--color-accent)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-soft)]"
          >
            Neu laden
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
