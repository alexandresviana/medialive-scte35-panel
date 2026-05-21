"use client";

import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils";
import type { LogEntry } from "@/lib/api";

interface LogPanelProps {
  logs: LogEntry[];
}

const levelColors: Record<string, string> = {
  INFO: "text-broadcast-blue",
  WARN: "text-broadcast-amber",
  ERROR: "text-broadcast-red",
};

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ScrollText className="h-4 w-4" />
          Logs em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 overflow-y-auto font-mono text-xs space-y-1">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aguardando eventos...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2 py-0.5 hover:bg-accent/30 rounded px-1">
                <span className="text-muted-foreground shrink-0">{formatTimestamp(log.timestamp)}</span>
                <span className={`shrink-0 font-semibold ${levelColors[log.level] || "text-foreground"}`}>
                  [{log.level}]
                </span>
                {log.channel_id && (
                  <span className="text-primary shrink-0">[{log.channel_id}]</span>
                )}
                <span className="truncate">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
