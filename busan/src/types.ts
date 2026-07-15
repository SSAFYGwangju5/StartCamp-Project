export interface Post {
  id: number;
  title: string;
  content: string;
  view_count: number;
  created_at: string;
}

export interface LocationStat {
  category: string;
  count: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}