import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  Stethoscope,
  XCircle
} from "lucide-react";

import API from "../services/api.js";
import "../styles/Appointments.css";

const initialForm = {
  doctorName: "",
  specialty: "",
  clinicName: "",
  appointmentAt: "",
  reason: "",
  notes: ""
};

const formatDate = (date) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/appointments");
      setAppointments(response.data.appointments || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.doctorName.trim() || !form.specialty.trim() || !form.appointmentAt) {
      setError("Doctor name, specialty and appointment date are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.post("/appointments", form);

      setSuccess("Appointment request saved. This is a personal request, not a confirmed booking.");
      setForm(initialForm);
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the appointment request.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (appointmentId, status) => {
    try {
      setSaving(true);
      setError("");

      await API.put(`/appointments/${appointmentId}`, { status });
      setSuccess("Appointment status updated.");
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update the appointment.");
    } finally {
      setSaving(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Cancel this appointment request?")) return;

    try {
      setSaving(true);
      setError("");

      await API.patch(`/appointments/${appointmentId}/cancel`);
      setSuccess("Appointment request cancelled.");
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel the appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="appointments-page">
      <header className="appointments-header">
        <div>
          <span className="appointments-eyebrow">
            <Stethoscope size={14} /> PROFESSIONAL SUPPORT
          </span>
          <h1>Appointments</h1>
          <p>Keep a personal record of requests and conversations with healthcare professionals.</p>
        </div>

        <button type="button" onClick={fetchAppointments} disabled={loading}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      <div className="appointments-safety-note">
        HerCycle does not confirm real-world availability or replace direct contact with a clinic.
      </div>

      {error && <div className="appointments-message error" role="alert">{error}</div>}
      {success && <div className="appointments-message success" role="status">{success}</div>}

      <section className="appointments-layout">
        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="appointment-form-heading">
            <Plus size={20} />
            <h2>Request appointment record</h2>
          </div>

          <label htmlFor="doctorName">Doctor name</label>
          <input
            id="doctorName"
            name="doctorName"
            value={form.doctorName}
            maxLength="100"
            onChange={handleChange}
            placeholder="Doctor or healthcare professional"
          />

          <label htmlFor="specialty">Medical specialty</label>
          <input
            id="specialty"
            name="specialty"
            value={form.specialty}
            maxLength="100"
            onChange={handleChange}
            placeholder="Gynecology, general medicine, etc."
          />

          <label htmlFor="clinicName">Clinic or hospital</label>
          <input
            id="clinicName"
            name="clinicName"
            value={form.clinicName}
            maxLength="100"
            onChange={handleChange}
          />

          <label htmlFor="appointmentAt">Date and time</label>
          <input
            id="appointmentAt"
            name="appointmentAt"
            type="datetime-local"
            value={form.appointmentAt}
            onChange={handleChange}
          />

          <label htmlFor="reason">Reason for visit</label>
          <textarea
            id="reason"
            name="reason"
            rows="3"
            maxLength="500"
            value={form.reason}
            onChange={handleChange}
          />

          <label htmlFor="notes">Personal notes</label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            maxLength="500"
            value={form.notes}
            onChange={handleChange}
            placeholder="Questions or documents to take"
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save appointment request"}
          </button>
        </form>

        <section className="appointment-history">
          <div className="appointment-history-heading">
            <div>
              <span>APPOINTMENT HISTORY</span>
              <h2>Your records</h2>
            </div>
            <strong>{appointments.length} records</strong>
          </div>

          {loading ? (
            <div className="appointment-loading">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="appointment-empty">
              <CalendarDays size={28} />
              <h3>No appointments recorded</h3>
              <p>Save a request after contacting a healthcare professional.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <article className={`appointment-card ${appointment.status}`} key={appointment._id}>
                  <div className="appointment-card-top">
                    <div>
                      <span>{appointment.specialty}</span>
                      <h3>{appointment.doctorName}</h3>
                      {appointment.clinicName && <p>{appointment.clinicName}</p>}
                    </div>
                    <span className={`appointment-status ${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="appointment-time">
                    <Clock size={16} />
                    {formatDate(appointment.appointmentAt)}
                  </div>

                  {appointment.reason && <p><strong>Reason:</strong> {appointment.reason}</p>}
                  {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}

                  {appointment.status !== "cancelled" && appointment.status !== "completed" && (
                    <div className="appointment-actions">
                      {appointment.status === "requested" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(appointment._id, "confirmed")}
                          disabled={saving}
                        >
                          <CheckCircle size={16} /> Mark confirmed
                        </button>
                      )}

                      {appointment.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(appointment._id, "completed")}
                          disabled={saving}
                        >
                          <CheckCircle size={16} /> Mark completed
                        </button>
                      )}

                      <button
                        type="button"
                        className="cancel"
                        onClick={() => cancelAppointment(appointment._id)}
                        disabled={saving}
                      >
                        <XCircle size={16} /> Cancel
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Appointments;
