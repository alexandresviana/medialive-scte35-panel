"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Cloud, CloudOff, Settings } from "lucide-react";
import { Header } from "@/components/header";
import { ChannelCard } from "@/components/channel-card";
import { BreakControl } from "@/components/break-control";
import { LogPanel } from "@/components/log-panel";
import { HistoryPanel } from "@/components/history-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWebSocket } from "@/hooks/use-websocket";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";

export default function DashboardPage() {
  const router = useRouter();
  const {
    token,
    channelIds,
    selectedChannelId,
    channels,
    logs,
    setChannelIds,
    setSelectedChannel,
    updateChannel,
    setLogs,
  } = useAppStore();

  useWebSocket();

  useEffect(() => {
    if (!token) router.push("/");
  }, [token, router]);

  const { data: health } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    enabled: !!token,
  });

  const { data: channelData, refetch: refetchChannels } = useQuery({
    queryKey: ["channels", channelIds],
    queryFn: () => api.getChannels(channelIds),
    enabled: !!token && channelIds.length > 0,
  });

  const { data: historyData } = useQuery({
    queryKey: ["history"],
    queryFn: () => api.getHistory(),
    enabled: !!token,
  });

  const { data: logsData } = useQuery({
    queryKey: ["logs"],
    queryFn: api.getLogs,
    enabled: !!token,
  });

  useEffect(() => {
    if (channelData) {
      channelData.forEach(updateChannel);
    }
  }, [channelData, updateChannel]);

  useEffect(() => {
    if (logsData) setLogs(logsData);
  }, [logsData, setLogs]);

  if (!token) return null;

  const selectedChannel = selectedChannelId ? channels[selectedChannelId] : undefined;

  return (
    <div className="min-h-screen broadcast-grid">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2 rounded-lg bg-card border px-4 py-2">
            {health?.aws_connected ? (
              <Cloud className="h-4 w-4 text-broadcast-green" />
            ) : (
              <CloudOff className="h-4 w-4 text-broadcast-red" />
            )}
            <span>AWS: {health?.aws_connected ? "Conectado" : "Desconectado"}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-card border px-4 py-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>v{health?.version || "1.0.0"}</span>
          </div>
        </div>

        {/* Channel config */}
        <div className="rounded-xl border bg-card/50 p-4">
          <Label htmlFor="channels" className="mb-2 block">
            IDs dos canais (separados por vírgula)
          </Label>
          <Input
            id="channels"
            defaultValue={channelIds.join(",")}
            onBlur={(e) => {
              const ids = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
              if (ids.length) setChannelIds(ids);
            }}
            className="font-mono"
          />
        </div>

        {/* Channel cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channelIds.map((id) => {
            const ch = channels[id] || {
              channel_id: id,
              name: id,
              state: "IDLE",
              input_bitrate: null,
              output_bitrate: null,
              active_break: false,
              break_event_id: null,
              break_remaining_seconds: null,
              scte35_status: "idle",
              pipeline_details: [],
            };
            return (
              <ChannelCard
                key={id}
                channel={ch}
                selected={selectedChannelId === id}
                onSelect={() => setSelectedChannel(id)}
              />
            );
          })}
        </div>

        {/* Control + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedChannelId && (
            <BreakControl
              channelId={selectedChannelId}
              activeBreak={selectedChannel?.active_break ?? false}
              onSuccess={() => refetchChannels()}
            />
          )}
          <LogPanel logs={logs} />
        </div>

        {/* History */}
        <HistoryPanel history={historyData || []} />
      </main>
    </div>
  );
}
