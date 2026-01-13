
export interface ServerInfo {
  ip: string;
  port: number;
  players: number;
  maxPlayers: number;
  status: 'online' | 'offline';
  version: string;
}

export interface PlayerSettings {
  nickname: string;
}

export type TabType = 'home' | 'assistant' | 'guide' | 'settings';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
