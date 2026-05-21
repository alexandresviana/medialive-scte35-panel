"use client";

import { useState } from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/app-store";

interface BreakControlProps {
  channelId: string;
  activeBreak: boolean;
  onSuccess: () => void;
}

export function BreakControl({ channelId, activeBreak, onSuccess }: BreakControlProps) {
  const [duration, setDuration] = useState(30);
  const [autoReturn, setAutoReturn] = useState(true);
  const [loading, setLoading] = useState<"break" | "return" | null>(null);
  const [error, setError] = useState("");
  const addLog = useAppStore((s) => s.addLog);

  const handleBreak = async () => {
    setLoading("break");
    setError("");
    try {
      const result = await api.triggerBreak(channelId, duration, autoReturn);
      addLog({
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `Break iniciado — ID do evento ${result.event_id}`,
        channel_id: channelId,
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao iniciar o break");
    } finally {
      setLoading(null);
    }
  };

  const handleReturn = async () => {
    setLoading("return");
    setError("");
    try {
      const result = await api.returnToNetwork(channelId);
      addLog({
        timestamp: new Date().toISOString(),
        level: "INFO",
        message: `Volta ao ar — ID do evento ${result.event_id}`,
        channel_id: channelId,
      });
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao voltar ao ar");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Break</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duração (segundos)</Label>
            <Input
              id="duration"
              type="number"
              min={5}
              max={600}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={activeBreak}
            />
          </div>
          <div className="space-y-2">
            <Label>Retorno automático</Label>
            <button
              type="button"
              onClick={() => setAutoReturn(!autoReturn)}
              className={`flex h-10 w-full items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                autoReturn
                  ? "border-broadcast-green bg-broadcast-green/10 text-broadcast-green"
                  : "border-border bg-background text-muted-foreground"
              }`}
              disabled={activeBreak}
            >
              {autoReturn ? "Ativado" : "Desativado"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="destructive"
            size="xl"
            onClick={handleBreak}
            disabled={loading !== null || activeBreak}
            className="w-full"
          >
            {loading === "break" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            INICIAR BREAK
          </Button>
          <Button
            variant="success"
            size="xl"
            onClick={handleReturn}
            disabled={loading !== null}
            className="w-full"
          >
            {loading === "return" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            VOLTAR AO AR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
