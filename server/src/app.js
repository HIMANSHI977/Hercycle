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
import hydrationRoutes from "./routes/hydration.routes.js";
import periodPreparationRoutes from "./routes/periodPreparation.routes.js";
import productRoutes from "./routes/product.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

// 1. CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

// 2. Parse incoming request bodies BEFORE routes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// 3. API routes
app.use("/api/push", pushRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/cycles", cycleRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/hydration", hydrationRoutes);
app.use("/api/period-preparation", periodPreparationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/appointments", appointmentRoutes);

// 4. API health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to HerCycle API!"
  });
});

// 5. Not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// 6. Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(error.status || 500).json({
    success: false,
    message: error.status === 400
      ? "Invalid request data"
      : "Internal server error"
  });
});

export default app;
