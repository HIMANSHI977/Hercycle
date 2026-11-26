import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Heart,
  Plus,
  Save
} from "lucide-react";

import API from "../services/api.js";
import "../styles/PeriodPreparation.css";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const PeriodPreparation = () => {
  const [estimatedNextPeriod, setEstimatedNextPeriod] = useState(null);
  const [daysUntilNextPeriod, setDaysUntilNextPeriod] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [personalNotes, setPersonalNotes] = useState("");
  const [reminderLeadDays, setReminderLeadDays] = useState(3);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPreparation = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/period-preparation");

      setEstimatedNextPeriod(response.data.estimatedNextPeriod);
      setDaysUntilNextPeriod(response.data.daysUntilNextPeriod);
      setChecklist(response.data.plan?.checklist || []);
      setPersonalNotes(response.data.plan?.personalNotes || "");
      setReminderLeadDays(response.data.plan?.reminderLeadDays ?? 3);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your period preparation plan."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreparation();
  }, []);

  const toggleChecklistItem = (itemId) => {
    setChecklist((previous) =>
      previous.map((item) =>
        item.id === itemId
          ? { ...item, checked: !item.checked }
          : item
      )
    );
  };

  const addChecklistItem = () => {
    const label = newItem.trim();

    if (!label) {
      setError("Enter a checklist item.");
      return;
    }

    if (checklist.length >= 30) {
      setError("You can keep up to 30 checklist items.");
      return;
    }

    setChecklist((previous) => [
      ...previous,
      {
        id: `personal-${Date.now()}`,
        label,
        checked: false
      }
    ]);
    setNewItem("");
    setError("");
  };

  const removeChecklistItem = (itemId) => {
    setChecklist((previous) =>
      previous.filter((item) => item.id !== itemId)
    );
  };

  const savePreparation = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.put("/period-preparation", {
        checklist,
        personalNotes,
        reminderLeadDays
      });

      setSuccess("Your period preparation plan has been saved.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save your preparation plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const completedItems = checklist.filter((item) => item.checked).length;
  const completionPercentage = checklist.length
    ? Math.round((completedItems / checklist.length) * 100)
    : 0;

  return (
    <main className="period-preparation-page">
      <header className="period-preparation-header">
        <div>
          <span className="period-preparation-eyebrow">
            <CalendarDays size={14} /> PERIOD PLANNING
          </span>
          <h1>Period Preparation</h1>
          <p>Plan comfort essentials and keep your personal preparation checklist ready.</p>
        </div>

        <button
          type="button"
          onClick={fetchPreparation}
          disabled={loading}
          className="period-preparation-refresh"
        >
          Refresh
        </button>
      </header>

      {error && <div className="period-preparation-message error" role="alert">{error}</div>}
      {success && <div className="period-preparation-message success" role="status">{success}</div>}

      {loading ? (
        <div className="period-preparation-loading">Loading your preparation plan...</div>
      ) : (
        <>
          <section className="period-estimate-card">
            <div className="period-estimate-icon">
              <CalendarDays size={28} />
            </div>

            <div>
              <span>ESTIMATED NEXT PERIOD</span>
              <h2>{formatDate(estimatedNextPeriod)}</h2>
              {daysUntilNextPeriod !== null ? (
                <p>
                  {daysUntilNextPeriod >= 0
                    ? `${daysUntilNextPeriod} day${daysUntilNextPeriod === 1 ? "" : "s"} until the estimate`
                    : "This estimate has passed; your period may have started or dates may vary"}
                </p>
              ) : (
                <p>Add a period start date in Cycle Tracker to create an estimate.</p>
              )}
              <small>Cycle dates are estimates and may vary.</small>
            </div>
          </section>

          <form onSubmit={savePreparation}>
            <section className="preparation-checklist-card">
              <div className="preparation-card-heading">
                <div>
                  <span><ClipboardCheck size={15} /> PREPARATION CHECKLIST</span>
                  <h2>{completionPercentage}% ready</h2>
                </div>
                <strong>{completedItems}/{checklist.length} completed</strong>
              </div>

              <progress
                className="preparation-progress"
                value={completionPercentage}
                max="100"
                aria-label={`${completionPercentage}% preparation completed`}
              />

              {checklist.length === 0 ? (
                <div className="preparation-empty">
                  <Heart size={25} />
                  <p>Add a personal item to start your checklist.</p>
                </div>
              ) : (
                <div className="preparation-checklist">
                  {checklist.map((item) => (
                    <div className="preparation-checklist-row" key={item.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleChecklistItem(item.id)}
                        />
                        <CheckCircle size={18} />
                        <span className={item.checked ? "checked" : ""}>{item.label}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(item.id)}
                        aria-label={`Remove ${item.label}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="preparation-add-item">
                <input
                  type="text"
                  value={newItem}
                  maxLength="120"
                  onChange={(event) => setNewItem(event.target.value)}
                  placeholder="Add your own preparation item"
                />
                <button type="button" onClick={addChecklistItem}>
                  <Plus size={17} /> Add item
                </button>
              </div>
            </section>

            <section className="preparation-details-grid">
              <div className="preparation-detail-card">
                <label htmlFor="reminderLeadDays">Preparation reminder timing</label>
                <select
                  id="reminderLeadDays"
                  value={reminderLeadDays}
                  onChange={(event) => setReminderLeadDays(Number(event.target.value))}
                >
                  <option value="0">On the estimated date</option>
                  <option value="1">1 day before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                </select>
                <p>This preference is saved for your personal preparation plan.</p>
              </div>

              <div className="preparation-detail-card">
                <label htmlFor="personalNotes">Personal notes</label>
                <textarea
                  id="personalNotes"
                  value={personalNotes}
                  maxLength="500"
                  rows="5"
                  onChange={(event) => setPersonalNotes(event.target.value)}
                  placeholder="Comfort items, product preferences or useful reminders"
                />
                <small>{personalNotes.length}/500</small>
              </div>
            </section>

            <button className="preparation-save-button" type="submit" disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save preparation plan"}
            </button>
          </form>
        </>
      )}
    </main>
  );
};

export default PeriodPreparation;
