import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import PrivateRoute from "../components/PrivateRoute";
import RoleRoute from "../components/RoleRoute";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Dashboard from "../pages/Dashboard";
import NuevaMascota from "../pages/NuevaMascota";
import NuevaCita from "../pages/NuevaCita";
import Disponibilidad from "../pages/Disponibilidad";
import CitasEspecialista from "../pages/CitasEspecialista";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mascotas/nueva"
          element={
            <PrivateRoute>
              <NuevaMascota />
            </PrivateRoute>
          }
        />
        <Route
          path="/citas/nueva"
          element={
            <PrivateRoute>
              <NuevaCita />
            </PrivateRoute>
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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
