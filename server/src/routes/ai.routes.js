
import express from "express";

import protect from "../middleware/auth.middleware.js";
import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protect);

router.post("/chat", chatWithAI);

export default router;
