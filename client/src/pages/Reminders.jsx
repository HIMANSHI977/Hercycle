
import { useEffect, useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  CalendarDays,
  CheckCircle,
  X
} from "lucide-react";

import API from "../services/api.js";
import { getSocket } from "../services/socket.js";

import "../styles/Reminders.css";
import "../styles/ReminderDueNotification.css";

import SpeakButton from "../components/SpeakButton.jsx";
import SnoozeButtons from "../components/SnoozeButtons.jsx";

const reminderTypes = [
  { value: "period", label: "Period" },
  { value: "product_stock", label: "Product stock" },
  { value: "medicine", label: "Medicine" },
  { value: "hydration", label: "Hydration" },
  { value: "general", label: "General" }
];

// Convert VAPID public key into the format required by PushManager.
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  return Uint8Array.from(
    [...rawData].map((char) => char.charCodeAt(0))
  );
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("period");
  const [scheduledAt, setScheduledAt] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // In-app due notification
  const [dueNotification, setDueNotification] = useState(null);

  // Browser notification permission
  const [notificationPermission, setNotificationPermission] =
    useState(() => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window
      ) {
        return Notification.permission;
      }

      return "unsupported";
    });

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      setError("");

      const response = await API.get("/reminders");

      const data = response.data.reminders || [];

      setReminders(
        data.sort(
          (a, b) =>
            new Date(a.scheduledAt) -
            new Date(b.scheduledAt)
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load reminders."
      );
    } finally {
      setLoading(false);
    }
  };

  // Enable browser and background push notifications
  const enableBrowserNotifications = async () => {
    try {
      if (
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window)
      ) {
        setError(
          "Your browser does not support push notifications."
        );
        return;
      }

      setError("");
      setSuccess("");

      // Request notification permission
      const permission = await Notification.requestPermission();

      setNotificationPermission(permission);

      if (permission !== "granted") {
        setError(
          "Please allow notifications in your browser settings."
        );
        return;
      }

      // Register service worker
      const registration =
        await navigator.serviceWorker.register(
          "/service-worker.js"
        );

      await navigator.serviceWorker.ready;

      // Get VAPID public key from backend
      const keyResponse = await API.get("/push/public-key");

      const publicKey = keyResponse.data.publicKey;

      if (!keyResponse.data.success || !publicKey) {
        throw new Error(
          "Unable to retrieve push notification public key."
        );
      }

      // Check existing subscription
      let subscription =
        await registration.pushManager.getSubscription();

      // Create subscription if it does not exist
      if (!subscription) {
        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(publicKey)
          });
      }

      // Save subscription in backend
      const saveResponse = await API.post(
        "/push/subscribe",
        subscription.toJSON()
      );

      if (!saveResponse.data.success) {
        throw new Error(
          "Unable to save push notification subscription."
        );
      }

      setSuccess(
        "Push notifications enabled successfully!"
      );

      // Confirmation notification
      new Notification("HerCycle Notifications Enabled", {
        body:
          "You will now receive reminders even when HerCycle is closed.",
        icon: "/favicon.ico"
      });

    } catch (error) {
      console.error(
        "Push notification subscription error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to enable push notifications."
      );
    }
  };

  // Initial fetch and real-time updates
  useEffect(() => {
    fetchReminders();

    const socket = getSocket();

    if (!socket) return;

    const handleReminderUpdated = () => {
      fetchReminders();
    };

    const handleNewReminder = () => {
      fetchReminders();
    };

    const handleReminderDeleted = () => {
      fetchReminders();
    };

    const handleReminderDue = (payload) => {
      const reminder = payload?.reminder || payload;

      if (!reminder?._id) {
        console.error(
          "Invalid reminder-due event payload:",
          payload
        );
        return;
      }

      // Show in-app notification
      setDueNotification(reminder);

      // Show browser notification while app is open
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("HerCycle Reminder", {
          body: reminder.title,
          icon: "/favicon.ico",
          tag: reminder._id
        });
      }
    };

    socket.on("reminder-updated", handleReminderUpdated);
    socket.on("new-reminder", handleNewReminder);
    socket.on("reminder-deleted", handleReminderDeleted);
    socket.on("reminder-due", handleReminderDue);

    return () => {
      socket.off("reminder-updated", handleReminderUpdated);
      socket.off("new-reminder", handleNewReminder);
      socket.off("reminder-deleted", handleReminderDeleted);
      socket.off("reminder-due", handleReminderDue);
    };
  }, []);

  // Create reminder
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !scheduledAt) {
      setError("Please enter a title and date/time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please select a valid date and time.");
      return;
    }

    if (selectedDate.getTime() < Date.now()) {
      setError("Please select a future date and time.");
      return;
    }

    setSaving(true);

    try {
      const response = await API.post("/reminders", {
        title: title.trim(),
        type,
        scheduledAt: selectedDate.toISOString()
      });

      const newReminder = response.data.reminder;

      if (newReminder) {
        setReminders((previous) =>
          [...previous, newReminder].sort(
            (a, b) =>
              new Date(a.scheduledAt) -
              new Date(b.scheduledAt)
          )
        );
      } else {
        await fetchReminders();
      }

      setTitle("");
      setType("period");
      setScheduledAt("");

      setSuccess("Your reminder has been created!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark reminder as completed
  const handleComplete = async (id) => {
    try {
      setError("");
      setSuccess("");

      await API.put(`/reminders/${id}`, {
        isCompleted: true
      });

      setReminders((previous) =>
        previous.map((reminder) =>
          reminder._id === id
            ? { ...reminder, isCompleted: true }
            : reminder
        )
      );

      setSuccess("Reminder marked as completed!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete reminder."
      );
    }
  };

  // Delete reminder
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await API.delete(`/reminders/${id}`);

      setReminders((previous) =>
        previous.filter(
          (reminder) => reminder._id !== id
        )
      );

      if (dueNotification?._id === id) {
        setDueNotification(null);
      }

      setSuccess("Reminder deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete reminder."
      );
    }
  };

  // Handle successful snooze
  const handleSnoozed = async () => {
    setDueNotification(null);
    setSuccess("Reminder snoozed successfully!");
    await fetchReminders();
  };

  // Reminder statistics
  const totalReminders = reminders.length;

  const completedReminders = reminders.filter(
    (reminder) => reminder.isCompleted
  ).length;

  const pendingReminders =
    totalReminders - completedReminders;

  // Filter reminders
  const filteredReminders = reminders.filter((reminder) => {
    const matchesSearch = reminder.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      reminder.type === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" && reminder.isCompleted) ||
      (statusFilter === "pending" && !reminder.isCompleted);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus
    );
  });

  return (
    <div className="reminders-page">

      {/* Page Header */}
      <div className="reminders-header">
        <div>
          <span className="eyebrow">
            YOUR PERSONAL CARE
          </span>

          <h1>My Reminders</h1>

          <p>
            Small reminders to help you take care
            of yourself.
          </p>
        </div>

        <div className="reminders-header-actions">

          <div className="reminders-header-icon">
            <Bell size={30} />
          </div>

          {notificationPermission !== "granted" && (
            <button
              type="button"
              className="enable-notifications-button"
              onClick={enableBrowserNotifications}
              disabled={
                notificationPermission === "unsupported"
              }
            >
              <Bell size={17} />
              Enable Notifications
            </button>
          )}

          {notificationPermission === "granted" && (
            <span className="notifications-enabled">
              <CheckCircle size={17} />
              Notifications Enabled
            </span>
          )}

        </div>
      </div>

      {/* Due Reminder Notification */}
      {dueNotification && (
        <div
          className="reminders-due-alert"
          role="alert"
          aria-live="assertive"
        >
          <div className="reminders-due-icon">
            <Bell size={23} />
          </div>

          <div className="reminders-due-content">
            <strong>Reminder is due!</strong>

            <p>{dueNotification.title}</p>

            <span>
              Scheduled: {formatDate(dueNotification.scheduledAt)}
            </span>

            <SnoozeButtons
              reminderId={dueNotification._id}
              onSnoozed={handleSnoozed}
            />
          </div>

          <button
            type="button"
            className="reminders-due-dismiss"
            onClick={() => setDueNotification(null)}
            aria-label="Dismiss reminder notification"
          >
            <X size={19} />
          </button>
        </div>
      )}

      {/* Reminder Statistics */}
      <div className="reminder-stats">

        <div className="stat-card">
          <span className="stat-icon">
            <Bell size={22} />
          </span>

          <div>
            <h3>{totalReminders}</h3>
            <p>Total Reminders</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">
            <CheckCircle size={22} />
          </span>

          <div>
            <h3>{completedReminders}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">
            <CalendarDays size={22} />
          </span>

          <div>
            <h3>{pendingReminders}</h3>
            <p>Pending</p>
          </div>
        </div>

      </div>

      {/* Create Reminder Form */}
      <div className="reminder-form-card">

        <div className="reminder-form-heading">
          <div className="reminder-icon">
            <Plus size={22} />
          </div>

          <div>
            <h2>Create a reminder</h2>

            <p>
              Plan your health and daily wellness activities.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="reminder-form"
        >

          <div className="form-group">
            <label htmlFor="reminder-title">
              Reminder title
            </label>

            <input
              id="reminder-title"
              type="text"
              placeholder="e.g. Buy sanitary pads"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reminder-type">
              Reminder category
            </label>

            <select
              id="reminder-type"
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >
              {reminderTypes.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminder-date">
              Date and time
            </label>

            <input
              id="reminder-date"
              type="datetime-local"
              min={
                new Date(
                  Date.now() -
                  new Date().getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .slice(0, 16)
              }
              value={scheduledAt}
              onChange={(event) =>
                setScheduledAt(event.target.value)
              }
              required
            />
          </div>

          {error && (
            <p className="reminder-message error">
              {error}
            </p>
          )}

          {success && (
            <p className="reminder-message success">
              {success}
            </p>
          )}

          <button
            type="submit"
            className="create-reminder-button"
            disabled={saving}
          >
            <Plus size={18} />
            {saving ? "Creating..." : "Create Reminder"}
          </button>

        </form>
      </div>

      {/* Saved Reminders */}
      <div className="saved-reminders-section">

        {/* Search and Filters */}
        <div className="reminder-filters">

          <input
            type="text"
            placeholder="Search reminders..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="all">All Categories</option>

            {reminderTypes.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setStatusFilter("all");
            }}
          >
            Clear Filters
          </button>

        </div>

        <div className="saved-reminders-heading">
          <div>
            <span className="eyebrow">
              STAY ORGANIZED
            </span>

            <h2>Your saved reminders</h2>
          </div>

          <span className="reminder-count">
            {filteredReminders.length} reminders
          </span>
        </div>

        {loading ? (
          <p className="empty-reminders">
            Loading reminders...
          </p>
        ) : reminders.length === 0 ? (
          <div className="empty-reminders">
            <Bell size={32} />

            <h3>No reminders yet</h3>

            <p>
              Create your first reminder to get started.
            </p>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="empty-reminders">
            <Bell size={32} />

            <h3>No matching reminders</h3>

            <p>
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="saved-reminders-list">

            {filteredReminders.map((reminder) => {
              const category =
                reminderTypes.find(
                  (item) => item.value === reminder.type
                )?.label || reminder.type;

              const speechText =
                `Reminder: ${reminder.title}. ` +
                `Category: ${category}. ` +
                `Scheduled for: ${formatDate(
                  reminder.scheduledAt
                )}.`;

              return (
                <div
                  className={`saved-reminder ${
                    reminder.isCompleted
                      ? "completed"
                      : ""
                  }`}
                  key={reminder._id}
                >

                  <div className="saved-reminder-icon">
                    <CalendarDays size={21} />
                  </div>

                  <div className="saved-reminder-info">
                    <h3
                      className={
                        reminder.isCompleted
                          ? "completed-reminder"
                          : ""
                      }
                    >
                      {reminder.title}
                    </h3>

                    <p>
                      {category}
                      {" · "}
                      {formatDate(reminder.scheduledAt)}
                    </p>

                    {reminder.isCompleted && (
                      <span className="completed-label">
                        Completed
                      </span>
                    )}
                  </div>

                  <SpeakButton text={speechText} />

                  <button
                    type="button"
                    className="complete-reminder-button"
                    onClick={() =>
                      handleComplete(reminder._id)
                    }
                    disabled={reminder.isCompleted}
                    title="Mark as completed"
                  >
                    <CheckCircle size={18} />

                    {reminder.isCompleted
                      ? "Completed"
                      : "Complete"}
                  </button>

                  <button
                    type="button"
                    className="delete-reminder-button"
                    onClick={() =>
                      handleDelete(reminder._id)
                    }
                    aria-label={`Delete ${reminder.title}`}
                    title="Delete reminder"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default Reminders;
