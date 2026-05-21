/** Rótulos em pt-BR para valores técnicos da API (somente exibição). */

const CHANNEL_STATE: Record<string, string> = {
  IDLE: "Ocioso",
  RUNNING: "No ar",
  STARTING: "Iniciando",
  STOPPING: "Parando",
  RECOVERING: "Recuperando",
};

const SCTE35_STATUS: Record<string, string> = {
  idle: "Ocioso",
  break_active: "Break ativo",
  none: "—",
};

const BREAK_STATUS: Record<string, string> = {
  active: "Ativo",
  returning: "Retornando",
  completed: "Concluído",
  none: "—",
};

export function channelStateLabel(state: string): string {
  return CHANNEL_STATE[state] ?? state;
}

export function scte35StatusLabel(status: string): string {
  return SCTE35_STATUS[status] ?? status;
}

export function breakStatusLabel(status: string): string {
  return BREAK_STATUS[status] ?? status;
}
