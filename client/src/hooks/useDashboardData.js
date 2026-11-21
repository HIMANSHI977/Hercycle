
import { useCallback, useEffect, useState } from "react";
import API from "../services/api.js";
import { getSocket } from "../services/socket.js";

const sortReminders = (items) => {
  return [...items].sort(
    (a, b) =>
      new Date(a.scheduledAt) - new Date(b.scheduledAt)
  );
};

const useDashboardData = () => {
  const [cycles, setCycles] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [symptoms, setSymptoms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    const requests = [
      { name: "Cycle records", request: () => API.get("/cycles") },
      { name: "Cycle prediction", request: () => API.get("/cycles/prediction") },
      { name: "Wellness information", request: () => API.get("/wellness/today") },
      { name: "Reminders", request: () => API.get("/reminders") },
      { name: "Symptoms", request: () => API.get("/symptoms") }
    ];

    try {
      const results = await Promise.allSettled(
        requests.map((item) => item.request())
      );

      const failedRequests = [];

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failedRequests.push(requests[index].name);
          console.error(
            `${requests[index].name} API failed:`,
            result.reason
          );
          return;
        }

        const data = result.value.data;

        switch (index) {
          case 0:
            setCycles(data.cycles || []);
            break;

          case 1:
            setPrediction(data);
            break;

          case 2:
            setWellness(data);
            break;

          case 3:
            setReminders(
              sortReminders(data.reminders || [])
            );
            break;

          case 4:
            setSymptoms(data.symptoms || []);
            break;

          default:
            break;
        }
      });

      if (failedRequests.length === requests.length) {
        setError(
          "Unable to load dashboard data. Please check your connection and try again."
        );
      } else if (failedRequests.length > 0) {
        setError(
          `Some information could not be loaded: ${failedRequests.join(", ")}.`
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        "Something went wrong while loading your dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial dashboard loading
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time reminder updates
  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      console.warn("Socket is not initialized yet.");
      return;
    }

    const handleNewReminder = (reminder) => {
      if (!reminder?._id) return;

      setReminders((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === reminder._id
        );

        if (alreadyExists) return previous;

        return sortReminders([...previous, reminder]);
      });
    };

    const handleReminderUpdated = (updatedReminder) => {
      if (!updatedReminder?._id) return;

      setReminders((previous) =>
        sortReminders(
          previous.map((item) =>
            item._id === updatedReminder._id
              ? updatedReminder
              : item
          )
        )
      );
    };

    const handleReminderDeleted = (payload) => {
      const reminderId = payload?._id || payload?.reminderId;

      if (!reminderId) return;

      setReminders((previous) =>
        previous.filter(
          (item) => item._id !== reminderId
        )
      );
    };

    socket.on("new-reminder", handleNewReminder);
    socket.on("reminder-updated", handleReminderUpdated);
    socket.on("reminder-deleted", handleReminderDeleted);

    return () => {
      socket.off("new-reminder", handleNewReminder);
      socket.off("reminder-updated", handleReminderUpdated);
      socket.off("reminder-deleted", handleReminderDeleted);
    };
  }, []);

  return {
    cycles,
    prediction,
    wellness,
    reminders,
    symptoms,
    loading,
    error,
    refreshDashboard: fetchDashboardData
  };
};

export default useDashboardData;
