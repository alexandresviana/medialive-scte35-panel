"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/stores/app-store";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const { addLog, updateChannel, setWsConnected, token } = useAppStore();

  useEffect(() => {
    if (!token) return;

    const connect = () => {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "log") addLog(msg.data);
          if (msg.type === "countdown") {
            const { channel_id, remaining } = msg.data;
            const store = useAppStore.getState();
            const ch = store.channels[channel_id];
            if (ch) {
              updateChannel({
                ...ch,
                active_break: true,
                break_remaining_seconds: remaining,
                scte35_status: "break_active",
              });
            }
          }
          if (msg.type === "break_started" || msg.type === "break_ended") {
            // Channel refresh handled by React Query polling
          }
        } catch {
          // ignore parse errors
        }
      };
    };

    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [token, addLog, updateChannel, setWsConnected]);
}
