import ErrorState from "../components/ErrorState";

function NotFound() {
  return (
    <div className="container error-page">
      <ErrorState variant="notFound" title="404 · Esta página se perdió" to="/" actionLabel="Volver al inicio" />
    </div>
  );
}

export default NotFound;
