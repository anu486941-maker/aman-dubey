export interface VirtualFile {
  name: string;
  content: string;
  path: string;
  size: number;
  updatedAt: string;
}

export type AppWindowType = 'notepad' | 'chrome' | 'calculator' | 'cmd' | 'monitor' | 'status';

export interface AppWindow {
  id: AppWindowType;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis' | 'system';
  text: string;
  timestamp: string;
  action?: {
    action: string;
    speak: string;
    app?: string;
    command?: string;
    file_action?: 'create' | 'read' | 'write' | 'delete';
    file_path?: string;
    file_content?: string;
    search_query?: string;
    explanation?: string;
  };
}

export interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number; // in MB
  status: 'Running' | 'Suspended' | 'Idle';
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  coreTemp: number;
  networkSpeedDown: number;
  networkSpeedUp: number;
  firewallActive: boolean;
  quantumDecryptor: boolean;
  uptime: number; // in seconds
}
