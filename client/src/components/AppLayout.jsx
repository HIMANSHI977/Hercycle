
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";

import Sidebar from "./Sidebar.jsx";

import "../styles/App.css";
import "../styles/AppLayout.css";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <main className="app-main">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
