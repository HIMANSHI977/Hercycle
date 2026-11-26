import { useEffect, useState } from "react";
import { Droplets, Plus, RefreshCw, Target, Trash2 } from "lucide-react";

import API from "../services/api.js";
import "../styles/Hydration.css";

const quickAmounts = [250, 500, 750];

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit"
  });
};

const Hydration = () => {
  const [entries, setEntries] = useState([]);
  const [totalMl, setTotalMl] = useState(0);
  const [goalMl, setGoalMl] = useState(2000);
  const [goalInput, setGoalInput] = useState("2000");
  const [amountMl, setAmountMl] = useState("250");
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchHydration = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/hydration/today");

      setEntries(response.data.entries || []);
      setTotalMl(response.data.totalMl || 0);
      setGoalMl(response.data.goalMl || 2000);
      setGoalInput(String(response.data.goalMl || 2000));
      setPercentage(response.data.percentage || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load today's hydration progress."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHydration();
  }, []);

  const addIntake = async (selectedAmount) => {
    const amount = Number(selectedAmount ?? amountMl);

    if (!Number.isInteger(amount) || amount < 50 || amount > 3000) {
      setError("Enter an amount between 50 and 3000 ml.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.post("/hydration", { amountMl: amount });

      setSuccess(`${amount} ml of water recorded.`);
      await fetchHydration();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to record water intake."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = async (event) => {
    event.preventDefault();

    const goal = Number(goalInput);

    if (!Number.isInteger(goal) || goal < 500 || goal > 6000) {
      setError("Choose a daily goal between 500 and 6000 ml.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await API.put("/hydration/goal", { goalMl: goal });

      setSuccess("Daily hydration goal updated.");
      await fetchHydration();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update the hydration goal."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (entryId) => {
    try {
      setSaving(true);
      setError("");

      await API.delete(`/hydration/${entryId}`);

      setSuccess("Hydration entry removed.");
      await fetchHydration();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to remove the hydration entry."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="hydration-page">
      <header className="hydration-header">
        <div>
          <span className="hydration-eyebrow">
            <Droplets size={14} /> DAILY HYDRATION
          </span>
          <h1>Water & Hydration</h1>
          <p>Track today's water intake and maintain a routine that works for you.</p>
        </div>

        <button type="button" onClick={fetchHydration} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {error && <div className="hydration-message error" role="alert">{error}</div>}
      {success && <div className="hydration-message success" role="status">{success}</div>}

      {loading ? (
        <div className="hydration-loading">Loading today's hydration progress...</div>
      ) : (
        <>
          <section className="hydration-progress-card">
            <div className="hydration-progress-icon"><Droplets size={30} /></div>
            <div className="hydration-progress-content">
              <span>TODAY'S PROGRESS</span>
              <h2>{totalMl} ml <small>of {goalMl} ml</small></h2>
              <progress
                className="hydration-progress-track"
                value={percentage}
                max="100"
                aria-label={`${percentage}% of hydration goal`}
              />
              <p>{percentage}% of your daily goal</p>
            </div>
          </section>

          <section className="hydration-grid">
            <div className="hydration-card">
              <div className="hydration-card-heading">
                <Plus size={20} />
                <div>
                  <span>ADD WATER</span>
                  <h2>Record intake</h2>
                </div>
              </div>

              <div className="hydration-quick-buttons">
                {quickAmounts.map((amount) => (
                  <button
                    type="button"
                    key={amount}
                    onClick={() => addIntake(amount)}
                    disabled={saving}
                  >
                    +{amount} ml
                  </button>
                ))}
              </div>

              <form className="hydration-custom-form" onSubmit={(event) => {
                event.preventDefault();
                addIntake(amountMl);
              }}>
                <label htmlFor="waterAmount">Custom amount</label>
                <div>
                  <input
                    id="waterAmount"
                    type="number"
                    min="50"
                    max="3000"
                    step="50"
                    value={amountMl}
                    onChange={(event) => setAmountMl(event.target.value)}
                  />
                  <button type="submit" disabled={saving}>Add</button>
                </div>
              </form>
            </div>

            <div className="hydration-card">
              <div className="hydration-card-heading">
                <Target size={20} />
                <div>
                  <span>DAILY GOAL</span>
                  <h2>Set your target</h2>
                </div>
              </div>

              <form className="hydration-custom-form" onSubmit={updateGoal}>
                <label htmlFor="hydrationGoal">Goal in millilitres</label>
                <div>
                  <input
                    id="hydrationGoal"
                    type="number"
                    min="500"
                    max="6000"
                    step="100"
                    value={goalInput}
                    onChange={(event) => setGoalInput(event.target.value)}
                  />
                  <button type="submit" disabled={saving}>Save</button>
                </div>
              </form>

              <p className="hydration-tip">
                Individual fluid needs vary. Use a goal that feels practical and discuss unusual thirst or fluid concerns with a healthcare professional.
              </p>
            </div>
          </section>

          <section className="hydration-history">
            <div className="hydration-section-heading">
              <div>
                <span>TODAY</span>
                <h2>Intake history</h2>
              </div>
              <strong>{entries.length} entries</strong>
            </div>

            {entries.length === 0 ? (
              <div className="hydration-empty">
                <Droplets size={28} />
                <h3>No water entries yet</h3>
                <p>Add your first drink to start today's progress.</p>
              </div>
            ) : (
              <div className="hydration-entry-list">
                {entries.map((entry) => (
                  <div className="hydration-entry" key={entry._id}>
                    <div>
                      <Droplets size={18} />
                      <strong>{entry.amountMl} ml</strong>
                      <span>{formatTime(entry.recordedAt)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEntry(entry._id)}
                      disabled={saving}
                      aria-label="Remove hydration entry"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Hydration;
