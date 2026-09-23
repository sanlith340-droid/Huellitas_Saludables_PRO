import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

function MainLayout() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
