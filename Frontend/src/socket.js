import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],   // important for Render
  withCredentials: true
});

export default socket;