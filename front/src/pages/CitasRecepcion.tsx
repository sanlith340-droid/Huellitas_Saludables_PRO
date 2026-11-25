import PanelCitas from "../components/PanelCitas";

function CitasRecepcion() {
  return (
    <PanelCitas
      titulo="Agenda de citas"
      descripcion="Consulta y filtra las citas de la clínica. Desde recepción puedes cancelar una cita; la atención clínica corresponde al especialista."
      urlCitas="/citas"
      rolVista="recepcion"
    />
  );
}

export default CitasRecepcion;
