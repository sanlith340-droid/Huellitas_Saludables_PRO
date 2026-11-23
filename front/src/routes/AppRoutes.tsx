import { lazy } from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "../components/PrivateRoute";
import RoleRoute from "../components/RoleRoute";

/*
 * Las pantallas se cargan por separado (code splitting). Mientras llega el
 * archivo de la pantalla, MainLayout muestra la escena del perrito corriendo,
 * así que la navegación nunca deja un hueco en blanco.
 */
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/Login"));
const Registro = lazy(() => import("../pages/Registro"));
const RecuperarContrasena = lazy(() => import("../pages/RecuperarContrasena"));
const NuevaContrasena = lazy(() => import("../pages/NuevaContrasena"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Perfil = lazy(() => import("../pages/Perfil"));

const NuevaMascota = lazy(() => import("../pages/NuevaMascota"));
const ListaMascotas = lazy(() => import("../pages/ListaMascotas"));

const NuevaCita = lazy(() => import("../pages/NuevaCita"));
const Disponibilidad = lazy(() => import("../pages/Disponibilidad"));
const CitasEspecialista = lazy(() => import("../pages/CitasEspecialista"));
const CitasAdmin = lazy(() => import("../pages/CitasAdmin"));
const Notificaciones = lazy(() => import("../pages/Notificaciones"));
const GestionUsuarios = lazy(() => import("../pages/GestionUsuarios"));
const DashboardAdmin = lazy(() => import("../pages/DashboardAdmin"));

const NotFound = lazy(() => import("../pages/NotFound"));
const EstadosDemo = lazy(() => import("../pages/EstadosDemo"));

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/registro"
          element={<Registro />}
        />

        <Route
          path="/recuperar-contrasena"
          element={<RecuperarContrasena />}
        />

        <Route
          path="/nueva-contrasena"
          element={<NuevaContrasena />}
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />

        {/* LISTA DE MASCOTAS */}
        <Route
          path="/mascotas"
          element={
            <RoleRoute roles={["usuario"]}>
              <ListaMascotas />
            </RoleRoute>
          }
        />

        {/* FORMULARIO PARA REGISTRAR MASCOTA */}
        <Route
          path="/mascotas/nueva"
          element={
            <RoleRoute roles={["usuario"]}>
              <NuevaMascota />
            </RoleRoute>
          }
        />

        <Route
          path="/citas/nueva"
          element={
            <RoleRoute roles={["usuario"]}>
              <NuevaCita />
            </RoleRoute>
          }
        />

        <Route
          path="/disponibilidad"
          element={
            <RoleRoute roles={["recepcionista", "admin"]}>
              <Disponibilidad />
            </RoleRoute>
          }
        />

        <Route
          path="/citas/especialista"
          element={
            <RoleRoute roles={["especialista"]}>
              <CitasEspecialista />
            </RoleRoute>
          }
        />

        <Route
          path="/notificaciones"
          element={
            <RoleRoute roles={["especialista"]}>
              <Notificaciones />
            </RoleRoute>
          }
        />

        <Route
          path="/citas/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <CitasAdmin />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <DashboardAdmin />
            </RoleRoute>
          }
        />

        <Route
          path="/usuarios/admin"
          element={
            <RoleRoute roles={["admin"]}>
              <GestionUsuarios />
            </RoleRoute>
          }
        />

        {/* Vitrina de estados (solo en desarrollo): /estados */}
        {import.meta.env.DEV && <Route path="/estados" element={<EstadosDemo />} />}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Route>
    </Routes>
  );
};

export default AppRoutes;
