/**
 * components/ListaErrores.tsx
 * Muestra los errores de un formulario como una columna vertical:
 * cada error ocupa su propia fila y aparece uno detrás de otro
 * (con una pequeña animación escalonada), en lugar de un único
 * párrafo con todos los mensajes pegados.
 */

type Props = {
  errores: string[];
  className?: string;
  id?: string;
};

const RETARDO_MS = 160;

function ListaErrores({ errores = [], className = "", id }: Props) {
  // Sin repetidos ni vacíos: un mensaje, una fila.
  const visibles = [...new Set(errores.map((e) => String(e ?? "").trim()).filter(Boolean))];

  if (visibles.length === 0) return null;

  return (
    <div
      id={id}
      className={`lista-errores ${className}`.trim()}
      role="alert"
      aria-live="assertive"
      aria-atomic="false"
    >
      {visibles.map((texto, indice) => (
        <p
          key={texto}
          className="lista-errores__item"
          style={{ animationDelay: `${indice * RETARDO_MS}ms` }}
        >
          {texto}
        </p>
      ))}
    </div>
  );
}

export default ListaErrores;
