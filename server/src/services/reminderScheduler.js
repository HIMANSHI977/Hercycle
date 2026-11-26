
import Reminder from "../models/Reminder.js";
import { getIO } from "../config/socket.js";
import { sendPushNotification } from "./pushNotification.js";

const CHECK_INTERVAL_MS = 10 * 1000;
const RETRY_DELAY_MS = 60 * 1000;
const PROCESSING_TIMEOUT_MS = 2 * 60 * 1000;
const MAX_ATTEMPTS = 3;

let schedulerInterval = null;
let isChecking = false;

const processReminder = async (reminder) => {
  const now = new Date();
  const retryCutoff = new Date(now.getTime() - RETRY_DELAY_MS);
  const staleCutoff = new Date(now.getTime() - PROCESSING_TIMEOUT_MS);

  const claimedReminder = await Reminder.findOneAndUpdate(
    {
      _id: reminder._id,
      isNotified: false,
      isActive: true,
      isCompleted: false,
      notificationAttempts: { $lt: MAX_ATTEMPTS },
      $and: [
        {
          $or: [
            { isProcessing: false },
            { isProcessing: { $exists: false } },
            { processingAt: { $lte: staleCutoff } }
          ]
        },
        {
          $or: [
            { lastNotificationAttemptAt: null },
            { lastNotificationAttemptAt: { $lte: retryCutoff } }
          ]
        }
      ]
    },
    {
      $set: {
        isProcessing: true,
        processingAt: now,
        lastNotificationAttemptAt: now
      },
      $inc: {
        notificationAttempts: 1
      }
    },
    { new: true }
  );

  if (!claimedReminder) return;

  const reminderId = claimedReminder._id.toString();
  const userId = claimedReminder.user.toString();
  const attempt = claimedReminder.notificationAttempts;

  // Only update the reminder if this scheduler still owns the lock.
  const lockFilter = {
    _id: claimedReminder._id,
    isProcessing: true,
    processingAt: now
  };

  try {
    const payload = {
      _id: reminderId,
      reminderId,
      title: claimedReminder.title,
      type: claimedReminder.type,
      scheduledAt: claimedReminder.scheduledAt,
      body: claimedReminder.title,
      url: "/"
    };

    if (attempt === 1) {
      getIO()
        .to(`user:${userId}`)
        .emit("reminder-due", payload);
    }

    const delivery = await sendPushNotification(
      claimedReminder.user,
      {
        title: "HerCycle Reminder",
        body: claimedReminder.title,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: reminderId,
        data: {
          reminderId,
          url: "/"
        },
        actions: [
          { action: "snooze-5", title: "Snooze 5 min" },
          { action: "snooze-10", title: "Snooze 10 min" },
          { action: "snooze-15", title: "Snooze 15 min" }
        ]
      }
    );

    const sent = delivery?.sent ?? 0;
    const failed = delivery?.failed ?? 0;
    const attempted = delivery?.attempted ?? 0;

    const success = sent > 0 || attempted === 0;

    if (success || attempt >= MAX_ATTEMPTS) {
      await Reminder.updateOne(
        lockFilter,
        {
          $set: {
            isNotified: true,
            isProcessing: false,
            processingAt: null,
            lastNotificationError: success
              ? null
              : `Push delivery failed after ${attempt} attempts (${failed} failures)`
          }
        }
      );
    } else {
      await Reminder.updateOne(
        lockFilter,
        {
          $set: {
            isProcessing: false,
            processingAt: null,
            lastNotificationError: `${failed} push notification(s) failed`
          }
        }
      );
    }

    console.log(
      `Reminder: ${claimedReminder.title} | Attempt: ${attempt} | Sent: ${sent} | Failed: ${failed}`
    );
  } catch (error) {
    await Reminder.updateOne(
      lockFilter,
      {
        $set: {
          isProcessing: false,
          processingAt: null,
          lastNotificationError: error.message,
          ...(attempt >= MAX_ATTEMPTS ? { isNotified: true } : {})
        }
      }
    );

    console.error(
      `Reminder processing failed (${reminderId}):`,
      error.message
    );
  }
};

const checkPendingReminders = async () => {
  if (isChecking) return;

  isChecking = true;

  try {
    const reminders = await Reminder.find({
      scheduledAt: { $lte: new Date() },
      isActive: true,
      isCompleted: false,
      isNotified: false,
      notificationAttempts: { $lt: MAX_ATTEMPTS }
    }).sort({ scheduledAt: 1 });

    for (const reminder of reminders) {
      await processReminder(reminder);
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error.message);
  } finally {
    isChecking = false;
  }
};

export const startReminderScheduler = () => {
  if (schedulerInterval) return;

  console.log("Reminder scheduler started");

  checkPendingReminders();

  schedulerInterval = setInterval(
    checkPendingReminders,
    CHECK_INTERVAL_MS
  );
};
