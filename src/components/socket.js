import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

if (!SOCKET_URL) {
  console.error("❌ VITE_SOCKET_URL is not defined! Socket connection will fail. Please check your environment variables.");
}

export const socket = io(SOCKET_URL || "", {
  autoConnect: false,
  transports: ["websocket"],
  // reconnection options (tweak if needed)
  // reconnection: true,
  // reconnectionAttempts: 5,
  // reconnectionDelay: 1000,
});

//console.log("socket helper created, connecting to:", SOCKET_URL);
