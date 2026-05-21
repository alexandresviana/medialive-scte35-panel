"use client";

import { Radio, Wifi, WifiOff } from "lucide-react";
import { useAppStore } from "@/stores/app-store";

export function Header() {
  const { username, wsConnected, logout } = useAppStore();

  return (
    <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Radio className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SCTE-35 Controller</h1>
            <p className="text-xs text-muted-foreground">AWS MediaLive NOC Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {wsConnected ? (
              <Wifi className="h-4 w-4 text-broadcast-green" />
            ) : (
              <WifiOff className="h-4 w-4 text-broadcast-red" />
            )}
            <span className="text-muted-foreground">
              {wsConnected ? "Live" : "Reconnecting..."}
            </span>
          </div>
          {username && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{username}</span>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
