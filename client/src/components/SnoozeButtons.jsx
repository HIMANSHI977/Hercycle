
import { useState } from "react";
import { Clock } from "lucide-react";

import API from "../services/api.js";
import "../styles/ReminderDueNotification.css";

const SnoozeButtons = ({ reminderId, onSnoozed }) => {
  const [loading, setLoading] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(null);
  const [error, setError] = useState("");

  const handleSnooze = async (minutes) => {
    if (loading || !reminderId) return;

    try {
      setLoading(true);
      setSelectedMinutes(minutes);
      setError("");

      await API.patch(
        `/reminders/${reminderId}/snooze`,
        { minutes }
      );

      if (onSnoozed) {
        await onSnoozed();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to snooze this reminder."
      );
    } finally {
      setLoading(false);
      setSelectedMinutes(null);
    }
  };

  return (
    <div className="snooze-container">
      <div className="snooze-heading">
        <Clock size={16} />
        <span>Snooze reminder</span>
      </div>

      <div className="snooze-options">
        {[5, 10, 15].map((minutes) => (
          <button
            key={minutes}
            type="button"
            className="snooze-button"
            onClick={() => handleSnooze(minutes)}
            disabled={loading}
          >
            {loading && selectedMinutes === minutes
              ? "Saving..."
              : `${minutes} min`}
          </button>
        ))}
      </div>

      {error && (
        <p className="snooze-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default SnoozeButtons;
