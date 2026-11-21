
import {
  LayoutDashboard,
  CalendarDays,
  Heart,
  MessageCircle,
  Leaf,
  Settings,
  Droplets,
  X
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  {
    name: "Cycle Tracker",
    icon: CalendarDays,
    path: "/cycle-tracker"
  },
  {
    name: "Wellness",
    icon: Heart,
    path: "/wellness"
  },
  {
    name: "AI Assistant",
    icon: MessageCircle,
    path: "/ai-assistant"
  },
  {
    name: "Diet & Nutrition",
    icon: Leaf,
    path: "/diet"
  },
  {
    name: "Reminders",
    icon: Droplets,
    path: "/reminders"
  },
  { name: "Yoga & Self-Care",
     icon: Heart,
      path:  "/self-care" },
];

const Sidebar = ({ open, setOpen }) => {
  const closeSidebar = () => setOpen(false);

  const getLinkClass = ({ isActive }) =>
    `menu-item ${isActive ? "active" : ""}`;

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Heart size={23} />
          </div>

          <div>
            <h2>HerCycle</h2>
            <span>Your wellness companion</span>
          </div>

          <button
            type="button"
            className="close-sidebar"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <p className="menu-label">MENU</p>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={getLinkClass}
                onClick={closeSidebar}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <Heart size={20} />

            <h4>Take care of yourself</h4>

            <p>
              Small steps towards better wellness every day.
            </p>
          </div>

          <NavLink
            to="/settings"
            end
            className={getLinkClass}
            onClick={closeSidebar}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
