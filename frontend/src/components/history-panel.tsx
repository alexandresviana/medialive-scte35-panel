"use client";

import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTimestamp } from "@/lib/utils";
import { breakStatusLabel } from "@/lib/labels";
import type { BreakHistoryEntry } from "@/lib/api";

interface HistoryPanelProps {
  history: BreakHistoryEntry[];
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de Breaks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-left">
                <th className="pb-2 pr-4 font-medium">Horário</th>
                <th className="pb-2 pr-4 font-medium">Canal</th>
                <th className="pb-2 pr-4 font-medium">ID do evento</th>
                <th className="pb-2 pr-4 font-medium">Duração</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Nenhum break registrado
                  </td>
                </tr>
              ) : (
                history.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-mono text-xs">{formatTimestamp(entry.started_at)}</td>
                    <td className="py-2 pr-4">{entry.channel_id}</td>
                    <td className="py-2 pr-4 font-mono">{entry.event_id}</td>
                    <td className="py-2 pr-4">{entry.duration}s</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          entry.status === "active"
                            ? "bg-broadcast-red/20 text-broadcast-red"
                            : "bg-broadcast-green/20 text-broadcast-green"
                        }`}
                      >
                        {breakStatusLabel(entry.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
