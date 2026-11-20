/**
 * components/feedback/ErrorBoundary.tsx
 * Última red de seguridad: si un componente falla al dibujarse, en lugar de
 * dejar la página en blanco mostramos una pantalla amable con salida.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { FaHome, FaRedo } from "react-icons/fa";
import perrito from "../../assets/feedback/vacio-personal.webp";

type Props = { children: ReactNode };
type State = { error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Queda en la consola para poder diagnosticar sin romper la experiencia.
    console.error("[Huellitas] Algo falló al dibujar la pantalla:", error, info);
  }

  reiniciar = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="error-boundary" role="alert">
        <div className="error-boundary__tarjeta">
          <img className="error-boundary__arte" src={perrito} alt="" aria-hidden="true" />
          <p className="error-boundary__eyebrow">Huellitas Saludables</p>
          <h1>Se nos enredó la correa</h1>
          <p className="error-boundary__texto">
            Algo inesperado pasó mientras mostrábamos esta pantalla. Tu información está a salvo:
            puedes intentar de nuevo o volver al inicio.
          </p>
          <div className="error-boundary__acciones">
            <button type="button" className="btn btn-primary" onClick={this.reiniciar}>
              <FaRedo aria-hidden="true" /> Intentar de nuevo
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => window.location.assign("/")}
            >
              <FaHome aria-hidden="true" /> Volver al inicio
            </button>
          </div>
          <details className="error-boundary__detalle">
            <summary>Detalle técnico</summary>
            <pre>{error.message || String(error)}</pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
