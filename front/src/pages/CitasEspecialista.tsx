import { useAuth } from "../context/AuthContext";
import PanelCitas from "../components/PanelCitas";

function CitasEspecialista() {
  const { usuario } = useAuth();

  return (
    <PanelCitas
      titulo="Mis citas"
      descripcion={`Consultas asignadas para ${usuario?.nombre}. Decide si cada una fue atendida o cancelada.`}
      urlCitas={usuario?.id_usuario ? `/citas/especialista/${usuario.id_usuario}` : ""}
    />
  );
}

export default CitasEspecialista;
