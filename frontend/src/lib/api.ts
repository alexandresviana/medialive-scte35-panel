const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ChannelStatus {
  channel_id: string;
  name: string;
  state: string;
  input_bitrate: number | null;
  output_bitrate: number | null;
  active_break: boolean;
  break_event_id: number | null;
  break_remaining_seconds: number | null;
  scte35_status: string;
  pipeline_details: Record<string, unknown>[];
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  channel_id: string | null;
}

export interface BreakHistoryEntry {
  id: string;
  channel_id: string;
  event_id: number;
  duration: number;
  started_at: string;
  ended_at: string | null;
  status: string;
  triggered_by: string;
}

export interface HealthResponse {
  status: string;
  aws_connected: boolean;
  version: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro na requisição");
  }
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  health: () => request<HealthResponse>("/api/health"),

  getChannels: (channelIds: string[]) =>
    request<ChannelStatus[]>(`/api/channels?channel_ids=${channelIds.join(",")}`),

  triggerBreak: (channelId: string, duration: number, autoReturn: boolean) =>
    request<{ event_id: number; duration: number }>("/api/break", {
      method: "POST",
      body: JSON.stringify({ channel_id: channelId, duration, auto_return: autoReturn }),
    }),

  returnToNetwork: (channelId: string) =>
    request<{ event_id: number }>("/api/return", {
      method: "POST",
      body: JSON.stringify({ channel_id: channelId }),
    }),

  getLogs: () => request<LogEntry[]>("/api/logs"),

  getHistory: (channelId?: string) =>
    request<BreakHistoryEntry[]>(
      `/api/history${channelId ? `?channel_id=${channelId}` : ""}`
    ),
};
