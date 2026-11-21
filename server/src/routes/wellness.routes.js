
import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  getTodayWellness,
  getAllPhases
} from "../controllers/wellness.controller.js";

const router = express.Router();

router.use(protect);

router.get("/today", getTodayWellness);
router.get("/phases", getAllPhases);

export default router;
