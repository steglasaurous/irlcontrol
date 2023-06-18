import { Injectable } from '@nestjs/common';
import { AbstractChatClient } from './clients/abstract-chat.client';
import { ChatMessage } from './chat-message';
import { Subject } from 'rxjs';

@Injectable()
export class ChatManagerService {
    private chatClients: AbstractChatClient[] = [];
    private messages$: Subject<ChatMessage> = new Subject<ChatMessage>();

    private messageHistory: ChatMessage[] = [];

    public getMessagesObservable(): Subject<ChatMessage> {
        return this.messages$;
    }

    public addChatClient(chatClient: AbstractChatClient) {
        chatClient.messages$.subscribe((chatMessage) => {
            chatMessage.id = this.messageHistory.length;
            this.messageHistory.push(chatMessage);
            this.messages$.next(chatMessage);
        });

        this.chatClients.push(chatClient);
    }

    public connect() {
        for (const chatClient of this.chatClients) {
            chatClient.connect();
        }
    }

    public getMessagesSince(id: number): ChatMessage[] {
        return this.messageHistory.slice(id);
    }
}
