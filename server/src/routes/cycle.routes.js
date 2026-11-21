
import express from "express";

import protect from "../middleware/auth.middleware.js";

import {
  addCycle,
  getCycles,
  updateCycle,
  deleteCycle,
  getCyclePrediction
} from "../controllers/cycle.controller.js";

const router = express.Router();

// All cycle routes require authentication
router.use(protect);
router.get("/prediction", getCyclePrediction);
router.post("/", addCycle);
router.get("/", getCycles);
router.put("/:id", updateCycle);
router.delete("/:id", deleteCycle);
router.get("/prediction", getCyclePrediction);

export default router;
