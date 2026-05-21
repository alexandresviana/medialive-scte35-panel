"use client";

import { Activity, Signal, Tv } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCountdown } from "@/lib/utils";
import { channelStateLabel, scte35StatusLabel } from "@/lib/labels";
import type { ChannelStatus } from "@/lib/api";

interface ChannelCardProps {
  channel: ChannelStatus;
  selected: boolean;
  onSelect: () => void;
}

export function ChannelCard({ channel, selected, onSelect }: ChannelCardProps) {
  const isLive = channel.state === "RUNNING";
  const onBreak = channel.active_break;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-primary/50",
        selected && "border-primary ring-1 ring-primary/30 animate-glow",
        onBreak && "border-broadcast-red/50"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Tv className="h-4 w-4" />
            {channel.name || channel.channel_id}
          </CardTitle>
          <span
            className={cn(
              "status-dot",
              onBreak ? "status-dot-break" : isLive ? "status-dot-live" : "status-dot-idle"
            )}
          />
        </div>
        <p className="text-xs text-muted-foreground font-mono">{channel.channel_id}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Estado</p>
            <p className={cn("font-semibold", isLive ? "text-broadcast-green" : "text-muted-foreground")}>
              {channelStateLabel(channel.state)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">SCTE-35</p>
            <p className={cn("font-semibold", onBreak ? "text-broadcast-red" : "text-broadcast-blue")}>
              {scte35StatusLabel(channel.scte35_status)}
            </p>
          </div>
        </div>

        {onBreak && channel.break_remaining_seconds != null && (
          <div className="rounded-lg bg-broadcast-red/10 border border-broadcast-red/30 p-3 text-center">
            <p className="text-xs text-broadcast-red uppercase tracking-wider mb-1">Break ativo</p>
            <p className="text-3xl font-mono font-bold text-broadcast-red">
              {formatCountdown(channel.break_remaining_seconds)}
            </p>
            {channel.break_event_id && (
              <p className="text-xs text-muted-foreground mt-1">ID do evento: {channel.break_event_id}</p>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            Entrada: {channel.input_bitrate ? `${channel.input_bitrate} Mbps` : "—"}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Saída: {channel.output_bitrate ? `${channel.output_bitrate} Mbps` : "—"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
