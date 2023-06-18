import { AbstractChatClient } from './abstract-chat.client';
import { Subject } from 'rxjs';
import { ChatMessage } from '../chat-message';
import { Inject, Injectable } from '@nestjs/common';
import { RefreshingAuthProvider } from '@twurple/auth';
import * as fs from 'fs';
import { ChatClient, PrivateMessage } from '@twurple/chat';

@Injectable()
export class TwitchChatClient extends AbstractChatClient {
    messages$: Subject<ChatMessage> = new Subject<ChatMessage>();

    private authProvider: RefreshingAuthProvider;

    // Current token data
    private tokenData: any = undefined;

    private chatClient: ChatClient;

    constructor(
        @Inject('TWITCH_APP_CLIENT_ID') private twitchAppClientId: string,
        @Inject('TWITCH_APP_CLIENT_SECRET')
        private twitchAppClientSecret: string,
        private tokenFilePath: string,
        private twitchChannel: string,
    ) {
        super();
    }

    async connect() {
        if (this.chatClient != undefined && this.chatClient.isConnected) {
            // Don't bother reconnecting if we're already connected.
            return;
        }

        if (this.tokenData == undefined) {
            this.loadTokenData();
        }

        this.authProvider = new RefreshingAuthProvider({
            clientId: this.twitchAppClientId,
            clientSecret: this.twitchAppClientSecret,
            onRefresh: async (userId, newTokenData) => {
                await fs.writeFile(
                    this.tokenFilePath,
                    JSON.stringify(newTokenData, null, 4),
                    { encoding: 'utf-8' },
                    () => {},
                );
            },
        });
        await this.authProvider.addUserForToken(this.tokenData, ['chat']);

        this.chatClient = new ChatClient({
            authProvider: this.authProvider,
            channels: [this.twitchChannel],
        });

        // Tie into onConnect? OnDisconnect?
        this.chatClient.connect();

        this.chatClient.onMessage(
            async (
                channel: string,
                user: string,
                text: string,
                msg: PrivateMessage,
            ) => {
                this.messages$.next({
                    username: user,
                    message: text,
                    emotes: msg.emoteOffsets,
                    date: msg.date,
                    color: msg.userInfo.color,
                });
            },
        );
    }

    disconnect(): void {}

    private loadTokenData(): void {
        // FIXME: Add error handling for invalid JSON data, missing file, etc.
        this.tokenData = JSON.parse(
            fs.readFileSync(this.tokenFilePath).toString(),
        );
        console.log(this.tokenData);
    }
}
