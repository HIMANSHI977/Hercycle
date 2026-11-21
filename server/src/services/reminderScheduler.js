import Reminder from "../models/Reminder.js";
import { getIO } from "../config/socket.js";

import {
  sendPushNotification
} from "./pushNotification.js";

let schedulerInterval = null;
let isChecking = false;

const checkPendingReminders = async () => {
  if (isChecking) return;

  isChecking = true;

  try {
    const now = new Date();

    const reminders = await Reminder.find({
      scheduledAt: { $lte: now },
      isActive: true,
      isCompleted: false,
      isNotified: false
    }).sort({ scheduledAt: 1 });

    const io = getIO();

    for (const reminder of reminders) {
      const claimedReminder = await Reminder.findOneAndUpdate(
        {
          _id: reminder._id,
          isNotified: false,
          isActive: true,
          isCompleted: false
        },
        {
          $set: { isNotified: true }
        },
        { new: true }
      );

      if (!claimedReminder) continue;

      const payload = {
        _id: reminder._id.toString(),
        reminderId: reminder._id.toString(),
        title: reminder.title,
        type: reminder.type,
        scheduledAt: reminder.scheduledAt,
        body: reminder.title,
        url: "/"
      };

      // Existing in-app notification
      io.to(`user:${reminder.user.toString()}`).emit(
        "reminder-due",
        payload
      );

      // New background push notification
      await sendPushNotification(reminder.user, {
        title: "HerCycle Reminder",
        body: reminder.title,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: reminder._id.toString(),
        data: {
          reminderId: reminder._id.toString(),
          url: "/"
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

      console.log(`Reminder processed: ${reminder.title}`);
    }
  } catch (error) {
    console.error("Reminder scheduler error:", error.message);
  } finally {
    isChecking = false;
  }
};

export const startReminderScheduler = () => {
  if (schedulerInterval) {
    console.log("Reminder scheduler is already running");
    return;
  }

  console.log("Reminder scheduler started");

  checkPendingReminders();

  schedulerInterval = setInterval(
    checkPendingReminders,
    10 * 1000
  );
};