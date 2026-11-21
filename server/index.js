
import "dotenv/config";

import http from "http";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";
import { startReminderScheduler } from "./src/services/reminderScheduler.js";

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // Start reminder scheduler
    startReminderScheduler();

    httpServer.listen(PORT, () => {
      console.log(`HerCycle server running on port ${PORT}`);
      console.log("Socket.IO is ready");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
