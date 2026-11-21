
import {
  Bell,
  Menu,
  Search,
  ChevronDown
} from "lucide-react";

const Navbar = ({ setOpen }) => {
  return (
    <header className="navbar">
      <button
        className="mobile-menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={23} />
      </button>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search anything..."
        />
      </div>

      <div className="navbar-right">
        <button className="notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile">
          <div className="profile-avatar">H</div>
          <div className="profile-info">
            <strong>Himanshi</strong>
            <span>My Profile</span>
          </div>
          <ChevronDown size={17} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
