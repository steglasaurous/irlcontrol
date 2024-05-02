import { AbstractChatClient } from './clients/abstract-chat.client';
import { ChatMessageType } from './chat-message-type.enum';
import { TwitchChannelEventType } from './twitch-channel-event-type.enum';

export interface ChatMessage {
    id: string;
    messageType: ChatMessageType;
    // If this is a channel event, optionally include what type of channel event type it was.
    twitchChannelEventType?: TwitchChannelEventType;
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
