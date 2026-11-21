import express from "express";
import protect from "../middleware/auth.middleware.js";

import {
  getPublicKey,
  subscribeToPush,
  unsubscribeFromPush
} from "../controllers/push.controller.js";

const router = express.Router();

router.get("/public-key", protect, getPublicKey);
router.post("/subscribe", protect, subscribeToPush);
router.post("/unsubscribe", protect, unsubscribeFromPush);

export default router;