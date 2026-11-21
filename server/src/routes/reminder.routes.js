
import express from "express";

import { snoozeReminder } from "../controllers/reminder.controller.js";

import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
} from "../controllers/reminder.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createReminder);
router.get("/", protect, getReminders);
router.put("/:id", protect, updateReminder);
router.delete("/:id", protect, deleteReminder);
router.patch("/:id/snooze", protect, snoozeReminder);
export default router;
