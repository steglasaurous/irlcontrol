import { Inject, Injectable, Logger } from '@nestjs/common';
import { AbstractChatClient } from './clients/abstract-chat.client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatMessageReceiveEvent } from '../events/chat-message-receive.event';
import { ChatMessage } from './chat-message';

@Injectable()
export class ChatManagerService {
    private logger: Logger = new Logger(this.constructor.name);
    private messageHistory: ChatMessage[] = [];

    constructor(
        private eventEmitter: EventEmitter2,
        @Inject('ChatClients') private chatClients: AbstractChatClient[] = [],
    ) {
        chatClients.forEach((chatClient) => {
            chatClient.messages$.subscribe((chatMessage) => {
                this.messageHistory.push(chatMessage);
                this.eventEmitter.emit(ChatMessageReceiveEvent.name, {
                    chatMessage: chatMessage,
                } as ChatMessageReceiveEvent);
            });
        });

        this.connectAll();
    }

    public addChatClient(chatClient: AbstractChatClient) {
        chatClient.messages$.subscribe((chatMessage) => {
            this.messageHistory.push(chatMessage);
            this.eventEmitter.emit(ChatMessageReceiveEvent.name, {
                chatMessage: chatMessage,
            } as ChatMessageReceiveEvent);
        });

        this.chatClients.push(chatClient);
    }

    public async connectAll() {
        for (const chatClient of this.chatClients) {
            await chatClient.connect();
            this.logger.log('Connected');
        }
    }

    public getMessagesSince(id: string): ChatMessage[] {
        // Find the ID in question, and return all chat messages after that.
        if (id == '0') {
            // return it all.
            return this.messageHistory;
        }
        const index = this.messageHistory.findIndex((value) => {
            return value.id == id;
        });

        if (index >= this.messageHistory.length - 1) {
            return [];
        }
        return this.messageHistory.slice(index + 1);
    }
}
