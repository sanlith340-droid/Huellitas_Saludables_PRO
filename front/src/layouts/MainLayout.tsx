import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import PageBackButton from "../components/PageBackButton";
import BarraCargaGlobal from "../components/feedback/BarraCargaGlobal";
import AvisoSinConexion from "../components/feedback/AvisoSinConexion";
import LoadingState from "../components/feedback/LoadingState";
import "../styles/site-layout.css";

function MainLayout() {
  return (
    <div className="page">
      {/* Barra superior: aparece con cualquier petición a la API. */}
      <BarraCargaGlobal />
      <Navbar />
      <main className="main">
        <PageBackButton />
        <Suspense
          fallback={
            <div className="container layout-carga">
              <LoadingState
                variante="pagina"
                titulo="Abriendo esta pantalla"
                mensajes={[
                  "El perrito va corriendo a buscar tus datos...",
                  "Acomodando la sala de espera...",
                  "Ya casi llegamos, no te muevas.",
                ]}
              />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <AvisoSinConexion />
    </div>
  );
}

export default MainLayout;
