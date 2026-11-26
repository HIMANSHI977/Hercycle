import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  getPeriodPreparation,
  updatePeriodPreparation
} from "../controllers/periodPreparation.controller.js";

const router = express.Router();

router.use(protect);
router.get("/", getPeriodPreparation);
router.put("/", updatePeriodPreparation);

export default router;
