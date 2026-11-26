import {
  Bell,
  Menu,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ setOpen }) => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <button
        type="button"
        className="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={23} />
      </button>

      <div className="navbar-right">
        <button
          type="button"
          className="notification-btn"
          onClick={() => navigate("/reminders")}
          aria-label="Open reminders"
        >
          <Bell size={20} />
        </button>

        <button
          type="button"
          className="profile"
          onClick={() => navigate("/settings")}
        >
          <div className="profile-avatar">H</div>
          <div className="profile-info">
            <strong>HerCycle</strong>
            <span>Settings</span>
          </div>
          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
