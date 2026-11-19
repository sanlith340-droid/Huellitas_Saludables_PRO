import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PageBackButton from "../components/PageBackButton";

function MainLayout() {
  return (
    <div className="page">
      <Navbar />
      <main className="main">
        <PageBackButton />
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
