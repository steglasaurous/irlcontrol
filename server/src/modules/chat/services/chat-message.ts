import { AbstractChatClient } from './clients/abstract-chat.client';

export interface ChatMessage {
    id: string;
    username: string;
    channelName: string;
    message: string;
    emotes: Map<string, string[]>;
    date: Date;
    color: string;
    client: AbstractChatClient;
    userIsMod: boolean;
    userIsBroadcaster: boolean;
    userIsVip: boolean;
    userIsSubscriber: boolean;
}
