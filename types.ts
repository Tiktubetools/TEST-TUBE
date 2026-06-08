export type ToolCategory = 'youtube' | 'tiktok' | 'images' | 'ai';

export interface Tool {
  id: string;
  category: ToolCategory;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  premium: boolean;
}

export interface UserSession {
  username: string;
  email: string;
  role: 'user' | 'admin';
  usageCount: number;
  usageLimit: number;
  apiKey?: string;
  token?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  toolId: string;
  toolName: string;
  status: 'success' | 'failed';
  ipAddress: string;
}

export interface ToolUsageStat {
  toolId: string;
  name: string;
  nameAr: string;
  count: number;
  category: ToolCategory;
}

export interface ThumbnailData {
  videoId: string;
  title?: string;
  thumbnails: {
    resolution: string;
    width: number;
    height: number;
    url: string;
  }[];
}
