export interface ChatMessage {
    username: string;
    message: string;
    emotes: Map<string, string[]>;
    date: Date;
    color: string;
    id?: number; // Unique identifier for this message - added by ChatManager
}
