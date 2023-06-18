export interface ChatMessage {
  username: string;
  message: string;
  emotes: Map<string, string[]>;
  date: Date;
  color: string;
}
