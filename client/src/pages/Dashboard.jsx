
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Sun,
  Heart,
  ArrowRight,
  Sparkles,
  Coffee,
  Activity,
  CalendarDays,
  Bell,
  RefreshCw,
  X,
  Plus
} from "lucide-react";

import "../styles/Dashboard.css";

import API from "../services/api.js";
import CycleCard from "../components/CycleCard.jsx";
import SnoozeButtons from "../components/SnoozeButtons.jsx";
import useAuth from "../context/useAuth.js";
import useDashboardData from "../hooks/useDashboardData.js";
import { getSocket } from "../services/socket.js";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const Dashboard = () => {
  // All hooks must be called inside the component.
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    cycles,
    prediction,
    wellness,
    reminders,
    symptoms,
    loading,
    error,
    refreshDashboard
  } = useDashboardData();

  const [dueNotification, setDueNotification] = useState(null);
  const [notificationError, setNotificationError] = useState("");

  const processedReminders = useRef(new Set());

  // Show desktop notification using Service Worker.
  const showDesktopNotification = useCallback(async (reminder) => {
    if (
      !("Notification" in window) ||
      Notification.permission !== "granted" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification("HerCycle Reminder", {
        body: reminder.title,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: `reminder-${reminder._id}`,
        renotify: true,

        data: {
          reminderId: reminder._id
        },

        actions: [
          {
            action: "snooze-5",
            title: "Snooze 5 min"
          },
          {
            action: "snooze-10",
            title: "Snooze 10 min"
          },
          {
            action: "snooze-15",
            title: "Snooze 15 min"
          }
        ]
      });
    } catch (err) {
      console.error("Desktop notification failed:", err);
    }
  }, []);

  // Listen for reminders from Socket.IO.
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      console.warn("Socket is not initialized yet");
      return;
    }

    const handleReminderDue = (payload) => {
      const reminder = payload?.reminder || payload;

      if (!reminder?._id) return;

      if (processedReminders.current.has(reminder._id)) {
        return;
      }

      processedReminders.current.add(reminder._id);

      setDueNotification(reminder);
      setNotificationError("");

      showDesktopNotification(reminder);

      refreshDashboard();
    };

    socket.on("reminder-due", handleReminderDue);

    return () => {
      socket.off("reminder-due", handleReminderDue);
    };
  }, [refreshDashboard, showDesktopNotification]);

  // Receive snooze actions from Service Worker.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = async (event) => {
      const message = event.data;

      if (message?.type === "OPEN_REMINDER") {
        return;
      }

      if (message?.type !== "SNOOZE_REMINDER") {
        return;
      }

      const { reminderId, minutes } = message;

      if (!reminderId || ![5, 10, 15].includes(minutes)) {
        return;
      }

      try {
        setNotificationError("");

        await API.patch(
          `/reminders/${reminderId}/snooze`,
          { minutes }
        );

        setDueNotification((previous) =>
          previous?._id === reminderId ? null : previous
        );

        setNotificationError(
          `Reminder snoozed for ${minutes} minutes.`
        );

        processedReminders.current.delete(reminderId);

        await refreshDashboard();
      } catch (err) {
        console.error("Desktop snooze failed:", err);

        setNotificationError(
          err.response?.data?.message ||
          "Unable to snooze reminder."
        );
      }
    };

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, [refreshDashboard]);

  // Extract wellness information.
  const wellnessInfo =
    wellness?.wellness ||
    wellness?.data ||
    wellness;

  // Extract prediction information.
  const predictionInfo =
    prediction?.data ||
    prediction;

  const phase =
    wellnessInfo?.phase ||
    wellnessInfo?.currentPhase ||
    "Not available";

  const nextPeriod =
    predictionInfo?.estimatedNextPeriod ||
    predictionInfo?.prediction ||
    predictionInfo?.nextPeriodDate ||
    predictionInfo?.predictedNextPeriod ||
    predictionInfo?.nextPeriod ||
    null;

  const cycleList = Array.isArray(cycles) ? cycles : [];

  const latestCycle = cycleList[0];

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  const reminderList = Array.isArray(reminders)
    ? reminders
    : [];

  const symptomList = Array.isArray(symptoms)
    ? symptoms
    : [];

  return (
    <div className="dashboard">

      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <span className="eyebrow">
            {today.toUpperCase()} · YOUR WELLNESS SPACE
          </span>

          <h1>
            Hello, {user?.name || "there"} <span>🌸</span>
          </h1>

          <p>
            Take a moment for yourself. Your health and
            happiness matter.
          </p>
        </div>

        <div className="welcome-icon">
          <Sun size={35} />
        </div>
      </div>

      {/* Due Reminder Notification */}
      {dueNotification && (
        <div
          className="reminder-notification"
          role="alert"
          aria-live="polite"
        >
          <div className="reminder-notification-icon">
            <Bell size={22} />
          </div>

          <div className="reminder-notification-content">
            <strong>Reminder is due!</strong>

            <p>{dueNotification.title}</p>

            <span>
              Scheduled: {formatDate(dueNotification.scheduledAt)}
            </span>

            <SnoozeButtons
              reminderId={dueNotification._id}
              onSnoozed={() => {
                setDueNotification(null);

                processedReminders.current.delete(
                  dueNotification._id
                );

                refreshDashboard();
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setDueNotification(null)}
            aria-label="Dismiss notification"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {notificationError && (
        <p className="dashboard-error" role="status">
          {notificationError}
        </p>
      )}

      {/* Cycle Card */}
      <CycleCard
        cycles={cycleList}
        prediction={prediction}
        wellness={wellness}
        user={user}
      />

      {/* First Cycle Guidance */}
      {!loading && cycleList.length === 0 && (
        <section className="first-cycle-guide">
          <div className="first-cycle-icon">
            <CalendarDays size={30} />
          </div>

          <div className="first-cycle-content">
            <span>YOUR CYCLE JOURNEY STARTS HERE</span>

            <h2>Start tracking your period 🌸</h2>

            <p>
              You haven't added any period records yet.
              Record your last period to get started with
              cycle tracking and personalized estimates.
            </p>

            <div className="cycle-guide-steps">
              <div>
                <span>01</span>
                <p>Open Cycle Tracker</p>
              </div>

              <div>
                <span>02</span>
                <p>Enter your period start date</p>
              </div>

              <div>
                <span>03</span>
                <p>Add end date, flow and notes</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/cycle-tracker")}
            >
              <Plus size={18} />
              Record your first period
            </button>

            <small>
              Your next period estimate will appear after
              you save your period details.
            </small>
          </div>
        </section>
      )}

      {/* Dashboard Information */}
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL OVERVIEW</span>
          <h2>Your cycle insights</h2>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={refreshDashboard}
          disabled={loading}
        >
          Refresh <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <p>Loading your personal information...</p>
      ) : (
        <>
          {error && (
            <p className="dashboard-error">
              {error}
            </p>
          )}

          <div className="wellness-grid">

            {/* Cycle Information */}
            <div className="wellness-card">
              <div className="wellness-icon">
                <CalendarDays size={24} />
              </div>

              <span>CYCLE INFORMATION</span>

              <h3>{phase}</h3>

              <p>
                Latest period started:{" "}
                {formatDate(latestCycle?.periodStartDate)}
              </p>
            </div>

            {/* Next Period Estimate */}
            <div className="wellness-card">
              <div className="wellness-icon">
                <CalendarDays size={24} />
              </div>

              <span>NEXT PERIOD ESTIMATE</span>

              <h3>{formatDate(nextPeriod)}</h3>

              <p>
                {nextPeriod
                  ? "This is an estimate based on your recorded cycle information."
                  : "Add your period details to receive an estimated next period date."}
              </p>
            </div>

            {/* Symptoms */}
            <div className="wellness-card">
              <div className="wellness-icon">
                <Heart size={24} />
              </div>

              <span>YOUR SYMPTOMS</span>

              <h3>{symptomList.length} records</h3>

              <p>
                Your previously recorded symptom entries.
              </p>
            </div>

          </div>

          {/* Reminders */}
          <div className="section-heading">
            <div>
              <span className="eyebrow">STAY ORGANIZED</span>
              <h2>Your reminders</h2>
            </div>
          </div>

          <div className="wellness-card">
            <div className="wellness-icon">
              <Bell size={24} />
            </div>

            {reminderList.length > 0 ? (
              reminderList.slice(0, 4).map((reminder) => (
                <div key={reminder._id}>
                  <h3>{reminder.title}</h3>

                  <p>
                    {reminder.type} ·{" "}
                    {formatDate(reminder.scheduledAt)}
                  </p>
                </div>
              ))
            ) : (
              <p>You don't have any reminders yet.</p>
            )}
          </div>
        </>
      )}

      {/* Daily Wellness */}
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR DAILY CARE</span>
          <h2>Wellness corner</h2>
        </div>

        <button className="text-button" type="button">
          Explore <ArrowRight size={16} />
        </button>
      </div>

      <div className="wellness-grid">

        {/* Yoga */}
        <div className="wellness-card yoga-card">
          <div className="wellness-icon">
            <Activity size={24} />
          </div>

          <span>BODY & MOVEMENT</span>

          <h3>Gentle yoga</h3>

          <p>
            Discover relaxing movements for your body.
          </p>

          <button type="button">
            Explore yoga <ArrowRight size={16} />
          </button>
        </div>

        {/* Diet */}
        <div className="wellness-card diet-card">
          <div className="wellness-icon">
            <Coffee size={24} />
          </div>

          <span>NOURISH YOUR BODY</span>

          <h3>Healthy eating</h3>

          <p>
            Find nutritious Indian meals and food ideas.
          </p>

          <button type="button">
            Explore meals <ArrowRight size={16} />
          </button>
        </div>

        {/* Self Care */}
        <div className="wellness-card selfcare-card">
          <div className="wellness-icon">
            <Heart size={24} />
          </div>

          <span>SELF LOVE</span>

          <h3>Self-care tips</h3>

          <p>
            Make time for your physical and emotional wellbeing.
          </p>

          <button type="button">
            Explore tips <ArrowRight size={16} />
          </button>
        </div>

      </div>

      {/* AI Assistant Banner */}
      <div className="ai-banner">
        <div className="ai-banner-icon">
          <Sparkles size={26} />
        </div>

        <div className="ai-banner-content">
          <span>YOUR AI WELLNESS COMPANION</span>

          <h2>Have a question about your cycle?</h2>

          <p>
            Talk to your AI assistant in Hindi or English
            and explore reliable wellness information.
          </p>
        </div>

        <button className="ai-button" type="button">
          Start conversation <ArrowRight size={17} />
        </button>
      </div>

    </div>
  );
};

export default Dashboard;
