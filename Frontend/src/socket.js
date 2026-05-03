import { io } from "socket.io-client";

const socket = io("https://pciunotifybackend.onrender.com", {
  transports: ["websocket"],   // important for Render
  withCredentials: true
});

export default socket;