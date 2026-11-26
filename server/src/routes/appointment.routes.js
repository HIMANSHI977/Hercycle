import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  cancelAppointment,
  createAppointment,
  getAppointments,
  updateAppointment
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.use(protect);
router.get("/", getAppointments);
router.post("/", createAppointment);
router.put("/:id", updateAppointment);
router.patch("/:id/cancel", cancelAppointment);

export default router;
