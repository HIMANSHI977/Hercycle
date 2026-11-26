
import Reminder from "../models/Reminder.js";
import { getIO } from "../config/socket.js";

const allowedTypes = [
  "period",
  "product_stock",
  "medicine",
  "hydration",
  "general"
];

const notifyUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const { title, type, scheduledAt } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      !type ||
      !scheduledAt
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, type and scheduled date are required"
      });
    }

    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Title cannot exceed 100 characters"
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reminder type"
      });
    }

    const reminderDate = new Date(scheduledAt);

    if (
      Number.isNaN(reminderDate.getTime()) ||
      reminderDate <= new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid future date and time"
      });
    }

    const reminder = await Reminder.create({
      user: req.user._id,
      title: title.trim(),
      type,
      scheduledAt: reminderDate
    });

    notifyUser(req.user._id, "new-reminder", reminder);

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully",
      reminder
    });
  } catch (error) {
    console.error("Create reminder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create reminder"
    });
  }
};

// Get all reminders
export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({
      user: req.user._id
    }).sort({ scheduledAt: 1 });

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error("Get reminders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reminders"
    });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const {
      title,
      type,
      scheduledAt,
      isCompleted,
      isActive
    } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    if (title !== undefined) {
      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.trim().length > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Title must contain 1–100 characters"
        });
      }

      reminder.title = title.trim();
    }

    if (type !== undefined) {
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder type"
        });
      }

      reminder.type = type;
    }

    if (scheduledAt !== undefined) {
      const date = new Date(scheduledAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid reminder date"
        });
      }

      reminder.scheduledAt = date;
    }

    if (isCompleted !== undefined) {
      if (typeof isCompleted !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isCompleted must be true or false"
        });
      }

      reminder.isCompleted = isCompleted;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false"
        });
      }

      reminder.isActive = isActive;
    }

    // Reset notification state if the schedule changes.
    if (scheduledAt !== undefined) {
      reminder.isNotified = false;
      reminder.isProcessing = false;
      reminder.processingAt = null;
      reminder.notificationAttempts = 0;
      reminder.lastNotificationAttemptAt = null;
      reminder.lastNotificationError = null;
    }

    // Release processing if reminder is completed or deactivated.
    if (reminder.isCompleted || !reminder.isActive) {
      reminder.isProcessing = false;
      reminder.processingAt = null;
    }

    await reminder.save();

    notifyUser(req.user._id, "reminder-updated", reminder);

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully",
      reminder
    });
  } catch (error) {
    console.error("Update reminder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update reminder"
    });
  }
};

// Snooze reminder
export const snoozeReminder = async (req, res) => {
  try {
    const minutes = Number(req.body.minutes);
    const allowedMinutes = [5, 10, 15];

    if (!allowedMinutes.includes(minutes)) {
      return res.status(400).json({
        success: false,
        message: "Snooze duration must be 5, 10, or 15 minutes"
      });
    }

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    if (reminder.isCompleted || !reminder.isActive) {
      return res.status(400).json({
        success: false,
        message: "This reminder cannot be snoozed"
      });
    }

    reminder.scheduledAt = new Date(
      Date.now() + minutes * 60 * 1000
    );

    reminder.isNotified = false;
    reminder.isProcessing = false;
    reminder.processingAt = null;
    reminder.notificationAttempts = 0;
    reminder.lastNotificationAttemptAt = null;
    reminder.lastNotificationError = null;

    await reminder.save();

    notifyUser(req.user._id, "reminder-updated", reminder);

    return res.status(200).json({
      success: true,
      message: `Reminder snoozed for ${minutes} minutes`,
      reminder
    });
  } catch (error) {
    console.error("Snooze reminder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to snooze reminder"
    });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found"
      });
    }

    notifyUser(req.user._id, "reminder-deleted", {
      _id: reminder._id
    });

    return res.status(200).json({
      success: true,
      message: "Reminder deleted successfully"
    });
  } catch (error) {
    console.error("Delete reminder error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete reminder"
    });
  }
};
