
import express from "express";
import cors from "cors";
import pushRoutes from "./routes/push.routes.js";
import cycleRoutes from "./routes/cycle.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import reminderRoutes from "./routes/reminder.routes.js";
import symptomRoutes from "./routes/symptom.routes.js";
import wellnessRoutes from "./routes/wellness.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

// Middleware must run before API routes.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use("/api/push", pushRoutes);
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/symptoms", symptomRoutes);

// API health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to HerCycle API!"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

export default app;
