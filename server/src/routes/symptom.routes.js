import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  addSymptom,
  getSymptoms,
  updateSymptom,
  deleteSymptom,
  getSymptomInsights,
  getSymptomGuidance
} from "../controllers/symptom.controller.js";

const router = express.Router();

// All symptom routes require authentication
router.use(protect);

router.post("/", addSymptom);
router.get("/", getSymptoms);
router.get("/guidance", getSymptomGuidance);
router.get("/insights", getSymptomInsights);
router.put("/:id", updateSymptom);
router.delete("/:id", deleteSymptom);

export default router;
