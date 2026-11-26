
import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL.replace(/\/api\/?$/, "");

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    console.error("Socket connection requires an authentication token");
    return null;
  }

  if (socket) {
    if (socket.connected) {
      return socket;
    }

    socket.auth = { token };
    socket.connect();

    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"]
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.connect();

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;

    console.log("Socket disconnected successfully");
  }
};
