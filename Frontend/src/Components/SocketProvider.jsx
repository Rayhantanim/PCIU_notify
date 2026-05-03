import { useEffect } from "react";
import socket from "../socket";

const SocketProvider = () => {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return null; // UI কিছু দেখাবে না
};

export default SocketProvider;