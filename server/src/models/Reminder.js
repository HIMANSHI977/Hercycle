
import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    type: {
      type: String,
      enum: [
        "period",
        "product_stock",
        "medicine",
        "hydration",
        "general"
      ],
      required: true
    },

    scheduledAt: {
      type: Date,
      required: true
    },

    isCompleted: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isNotified: {
      type: Boolean,
      default: false
    },

    // Notification processing and retry fields
    isProcessing: {
      type: Boolean,
      default: false
    },

    processingAt: {
      type: Date,
      default: null
    },

    notificationAttempts: {
      type: Number,
      default: 0
    },

    lastNotificationAttemptAt: {
      type: Date,
      default: null
    },

    lastNotificationError: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

reminderSchema.index({ user: 1, scheduledAt: 1 });

reminderSchema.index({
  isActive: 1,
  isCompleted: 1,
  isNotified: 1,
  scheduledAt: 1
});

const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
