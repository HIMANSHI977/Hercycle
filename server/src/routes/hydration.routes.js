import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  addHydration,
  deleteHydration,
  getTodayHydration,
  updateHydrationGoal
} from "../controllers/hydration.controller.js";

const router = express.Router();

router.use(protect);
router.get("/today", getTodayHydration);
router.post("/", addHydration);
router.delete("/:id", deleteHydration);
router.put("/goal", updateHydrationGoal);

export default router;
