import PanelCitas from "../components/PanelCitas";

function CitasAdmin() {
  return (
    <PanelCitas
      titulo="Citas de la clínica"
      descripcion="Todas las citas de todos los especialistas. Filtra por especialista, fecha o estado y decide si cada una fue atendida o cancelada."
      urlCitas="/citas"
      modoAdmin
    />
  );
}

export default CitasAdmin;
