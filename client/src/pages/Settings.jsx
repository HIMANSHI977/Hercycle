import { useContext } from "react";
import { Moon, Sun, ShieldCheck } from "lucide-react";

import { ThemeContext } from "../context/ThemeContext.jsx";
import "../styles/Settings.css";

const Settings = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <span>PERSONAL PREFERENCES</span>
          <h1>Settings</h1>
          <p>Choose an experience that feels comfortable for you.</p>
        </div>
      </header>

      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-icon">
            {theme === "dark" ? <Moon size={22} /> : <Sun size={22} />}
          </div>
          <div>
            <h2>Appearance</h2>
            <p>Select a light or dark theme.</p>
          </div>
        </div>

        <div className="theme-options">
          <button
            type="button"
            className={theme === "light" ? "active" : ""}
            onClick={() => setTheme("light")}
          >
            <Sun size={18} /> Light
          </button>
          <button
            type="button"
            className={theme === "dark" ? "active" : ""}
            onClick={() => setTheme("dark")}
          >
            <Moon size={18} /> Dark
          </button>
        </div>
      </section>

      <section className="settings-card settings-note">
        <ShieldCheck size={22} />
        <div>
          <h2>Privacy reminder</h2>
          <p>Your wellness entries are accessible only through your authenticated account.</p>
        </div>
      </section>
    </main>
  );
};

export default Settings;
