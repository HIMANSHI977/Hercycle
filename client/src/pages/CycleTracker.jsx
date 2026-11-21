
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Droplets,
  Plus,
  Trash2,
  Edit,
  Save,
  X
} from "lucide-react";

import API from "../services/api.js";
import "../styles/CycleTracker.css";

const initialForm = {
  periodStartDate: "",
  periodEndDate: "",
  flow: "unknown",
  notes: ""
};

const getLocalDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "Not recorded";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const CycleTracker = () => {
  const [cycles, setCycles] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = getLocalDate(new Date());

  const fetchCycles = async () => {
    try {
      setLoading(true);

      const response = await API.get("/cycles");

      const records = response.data.cycles || [];

      records.sort(
        (a, b) =>
          new Date(b.periodStartDate) -
          new Date(a.periodStartDate)
      );

      setCycles(records);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your cycle records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
    setMessage("");
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.periodStartDate) {
      setError("Please select your period start date.");
      return;
    }

    if (form.periodStartDate > today) {
      setError("Period start date cannot be in the future.");
      return;
    }

    if (form.periodEndDate) {
      if (form.periodEndDate < form.periodStartDate) {
        setError("Period end date cannot be before the start date.");
        return;
      }

      if (form.periodEndDate > today) {
        setError("Period end date cannot be in the future.");
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        periodStartDate: form.periodStartDate,
        periodEndDate: form.periodEndDate || null,
        flow: form.flow,
        notes: form.notes.trim()
      };

      if (editingId) {
        await API.put(`/cycles/${editingId}`, payload);
        setMessage("Cycle record updated successfully.");
      } else {
        await API.post("/cycles", payload);
        setMessage("Your period record has been saved.");
      }

      setForm(initialForm);
      setEditingId(null);

      await fetchCycles();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save your cycle record."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cycle) => {
    setEditingId(cycle._id);

    setForm({
      periodStartDate: getLocalDate(cycle.periodStartDate),
      periodEndDate: cycle.periodEndDate
        ? getLocalDate(cycle.periodEndDate)
        : "",
      flow: cycle.flow || "unknown",
      notes: cycle.notes || ""
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cycle record?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await API.delete(`/cycles/${id}`);

      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }

      setMessage("Cycle record deleted successfully.");

      await fetchCycles();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this record."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="cycle-tracker-page">

      <div className="tracker-heading">
        <span className="eyebrow">UNDERSTAND YOUR BODY</span>

        <h1>Cycle Tracker 🌸</h1>

        <p>
          Keep track of your periods and understand your
          cycle patterns over time.
        </p>
      </div>

      <section className="cycle-form-card">

        <div className="tracker-section-title">
          <div className="tracker-icon">
            <Plus size={22} />
          </div>

          <div>
            <h2>
              {editingId
                ? "Edit period record"
                : "Record your period"}
            </h2>

            <p>Enter your period information below.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="cycle-form">

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="periodStartDate">
                Period start date
              </label>

              <input
                id="periodStartDate"
                type="date"
                name="periodStartDate"
                value={form.periodStartDate}
                onChange={handleChange}
                max={today}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="periodEndDate">
                Period end date
              </label>

              <input
                id="periodEndDate"
                type="date"
                name="periodEndDate"
                value={form.periodEndDate}
                onChange={handleChange}
                min={form.periodStartDate || undefined}
                max={today}
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="flow">Flow intensity</label>

            <select
              id="flow"
              name="flow"
              value={form.flow}
              onChange={handleChange}
            >
              <option value="unknown">Not sure</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>

            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Write anything you want to remember..."
              rows="3"
              maxLength="500"
            />
          </div>

          {error && (
            <p className="tracker-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="tracker-success" role="status">
              {message}
            </p>
          )}

          <div className="tracker-form-actions">

            <button type="submit" disabled={saving}>
              {saving ? (
                "Saving..."
              ) : editingId ? (
                <>
                  <Save size={17} />
                  Update record
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Save period
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>
            )}

          </div>
        </form>
      </section>

      <section className="cycle-history">

        <div className="tracker-section-title">
          <div className="tracker-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <h2>Period history</h2>
            <p>Your previously recorded cycles.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading your cycle records...</p>
        ) : cycles.length === 0 ? (
          <div className="empty-cycle-state">
            <Droplets size={35} />

            <h3>No cycle records yet</h3>

            <p>
              Your saved period records will appear here.
            </p>
          </div>
        ) : (
          <div className="cycle-history-list">

            {cycles.map((cycle) => (
              <article
                className="cycle-history-item"
                key={cycle._id}
              >
                <div className="history-date-icon">
                  <Droplets size={22} />
                </div>

                <div className="history-details">

                  <h3>
                    {formatDate(cycle.periodStartDate)}
                  </h3>

                  <p>
                    End date: {formatDate(cycle.periodEndDate)}
                  </p>

                  <span className="flow-label">
                    Flow: {cycle.flow || "unknown"}
                  </span>

                  {cycle.notes && (
                    <p>{cycle.notes}</p>
                  )}

                </div>

                <div className="history-actions">

                  <button
                    type="button"
                    onClick={() => handleEdit(cycle)}
                    aria-label="Edit cycle record"
                    disabled={deletingId === cycle._id}
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(cycle._id)}
                    aria-label="Delete cycle record"
                    disabled={deletingId === cycle._id}
                  >
                    {deletingId === cycle._id
                      ? "..."
                      : <Trash2 size={17} />}
                  </button>

                </div>
              </article>
            ))}

          </div>
        )}
      </section>

      <p className="cycle-tracker-disclaimer">
        Your cycle information is personal. Cycle patterns and
        predictions are estimates and are not medical diagnoses.
      </p>

    </div>
  );
};

export default CycleTracker;
