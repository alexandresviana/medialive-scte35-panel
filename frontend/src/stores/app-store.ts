import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChannelStatus, LogEntry } from "@/lib/api";

interface AppState {
  token: string | null;
  username: string | null;
  channelIds: string[];
  selectedChannelId: string | null;
  channels: Record<string, ChannelStatus>;
  logs: LogEntry[];
  wsConnected: boolean;
  setToken: (token: string, username: string) => void;
  logout: () => void;
  setChannelIds: (ids: string[]) => void;
  setSelectedChannel: (id: string) => void;
  updateChannel: (channel: ChannelStatus) => void;
  addLog: (log: LogEntry) => void;
  setLogs: (logs: LogEntry[]) => void;
  setWsConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      channelIds: ["1234567"],
      selectedChannelId: "1234567",
      channels: {},
      logs: [],
      wsConnected: false,
      setToken: (token, username) => set({ token, username }),
      logout: () => set({ token: null, username: null }),
      setChannelIds: (ids) =>
        set((s) => ({
          channelIds: ids,
          selectedChannelId: s.selectedChannelId || ids[0] || null,
        })),
      setSelectedChannel: (id) => set({ selectedChannelId: id }),
      updateChannel: (channel) =>
        set((s) => ({ channels: { ...s.channels, [channel.channel_id]: channel } })),
      addLog: (log) => set((s) => ({ logs: [log, ...s.logs].slice(0, 100) })),
      setLogs: (logs) => set({ logs }),
      setWsConnected: (connected) => set({ wsConnected: connected }),
    }),
    {
      name: "scte35-store",
      partialize: (s) => ({
        token: s.token,
        username: s.username,
        channelIds: s.channelIds,
        selectedChannelId: s.selectedChannelId,
      }),
    }
  )
);
