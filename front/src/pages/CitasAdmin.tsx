import PanelCitas from "../components/PanelCitas";

function CitasAdmin() {
  return (
    <PanelCitas
      titulo="Citas de la clínica"
      descripcion="Todas las citas de la clínica. Filtra por fecha, estado, mascota, propietario o motivo y actualiza su estado."
      urlCitas="/citas"
      rolVista="admin"
    />
  );
}

export default CitasAdmin;
