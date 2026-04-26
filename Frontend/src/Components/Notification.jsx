import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function Notification() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const socket = io("https://pciu-notify-backend.vercel.app"); // backend URL

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("newNotice", () => {
      setCount((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <Badge badgeContent={count} color="primary">
      <NotificationsIcon color="action" />
    </Badge>
  );
}
