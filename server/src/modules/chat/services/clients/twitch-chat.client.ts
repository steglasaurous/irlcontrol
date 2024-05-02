import { AbstractChatClient } from './abstract-chat.client';
import { Subject } from 'rxjs';
import { ChatMessage } from '../chat-message';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';

import * as fs from 'fs';
import { ChatClientConnectedEvent } from '../../events/chat-client-connected.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiClient, HelixUser } from '@twurple/api';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { ChatMessageType } from '../chat-message-type.enum';
import { TwitchChannelEventType } from '../twitch-channel-event-type.enum';

@Injectable()
export class TwitchChatClient extends AbstractChatClient {
    messages$: Subject<ChatMessage> = new Subject<ChatMessage>();

    private authProvider: RefreshingAuthProvider;

    // Current token data
    private tokenData: any = undefined;

    private chatClient: ChatClient;
    private apiClient: ApiClient;
    private eventSub: EventSubWsListener;
    private logger: Logger = new Logger(TwitchChatClient.name);

    constructor(
        @Inject('TWITCH_APP_CLIENT_ID') private twitchAppClientId: string,
        @Inject('TWITCH_APP_CLIENT_SECRET')
        private twitchAppClientSecret: string,
        private tokenFilePath: string,
        private twitchChannel: string,
        private eventEmitter: EventEmitter2,
        private wsUrl?: string,
    ) {
        super();
    }

    connect() {
        return new Promise<void>(async (resolve) => {
            if (this.tokenData == undefined) {
                this.loadTokenData();
            }
            if (this.tokenData) {
                this.authProvider = new RefreshingAuthProvider({
                    clientId: this.twitchAppClientId,
                    clientSecret: this.twitchAppClientSecret,
                });
                this.authProvider.onRefresh(async (userId, newTokenData) => {
                    fs.writeFile(
                        this.tokenFilePath,
                        JSON.stringify(newTokenData, null, 4),
                        { encoding: 'utf-8' },
                        () => {},
                    );
                });
                await this.authProvider.addUserForToken(this.tokenData, [
                    'chat',
                ]);

                this.chatClient = new ChatClient({
                    authProvider: this.authProvider,
                    channels: [this.twitchChannel],
                });
                this.logger.log('Connected as an authenticated user');
                // Setup eventsub connection, subscribe to relevant events.
                this.apiClient = new ApiClient({
                    authProvider: this.authProvider,
                });

                const user = await this.apiClient.users.getUserByName(
                    this.twitchChannel,
                );
                console.log('userId', user.id);
                // const fakeApiClient = new ApiClient({
                //     authProvider: this.authProvider,
                //     mockServerPort: 8080,
                //     logger: { minLevel: LogLevel.DEBUG },
                // });
                this.eventSub = new EventSubWsListener({
                    apiClient: this.apiClient,
                    // url: this.wsUrl,
                    logger: { minLevel: 'DEBUG' },
                });

                this.eventSub.start();
                await this.setupEventSubs(user);
            } else {
                // No token data? Connect anonymously
                this.chatClient = new ChatClient({
                    channels: [this.twitchChannel],
                });

                this.logger.log('Connected to twitch anonymously');
            }

            // Tie into onConnect? OnDisconnect?
            this.chatClient.onAuthenticationSuccess(() => {
                this.logger.log('Twitch chat connected');
                this.eventEmitter.emitAsync(ChatClientConnectedEvent.name, <
                    ChatClientConnectedEvent
                >{ client: this });
                resolve();
            });
            this.chatClient.connect();
            this.chatClient.onMessage(
                async (
                    channel: string,
                    user: string,
                    text: string,
                    msg: any,
                ) => {
                    this.messages$.next({
                        id: msg.id,
                        messageType: ChatMessageType.ChatMessage,
                        username: user,
                        channelName: channel,
                        message: text,
                        emotes: msg.emoteOffsets,
                        date: msg.date,
                        color: msg.userInfo.color,
                        client: this,
                        userIsBroadcaster: msg.userInfo.isBroadcaster,
                        userIsMod: msg.userInfo.isMod,
                        userIsSubscriber: msg.userInfo.isSubscriber,
                        userIsVip: msg.userInfo.isVip,
                    });
                },
            );
        });
    }

    async disconnect() {
        return;
    }

    private async setupEventSubs(user: HelixUser) {
        // New Follower
        // Raid
        // Channel point redeem
        // Cheer
        // Subscription/resub/gift subs

        this.eventSub.onChannelFollow(user.id, user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    eventSubEvent.followDate.getTime().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.userName,
                    TwitchChannelEventType.NewFollower,
                    eventSubEvent.followDate,
                    'New Follow!',
                ),
            );
        });

        this.eventSub.onChannelRaidTo(user.id, (eventSubEvent) => {});

        // this.eventSub.onChannelCheer(user.id, (eventSubEvent) => {});
        //
        // this.eventSub.onChannelSubscription(user.id, (eventSubEvent) => {});
        //
        // this.eventSub.onChannelSubscriptionGift(user.id, (eventSubEvent) => {});
        // this.eventSub.onChannelSubscriptionMessage(
        //     user.id,
        //     (eventSubEvent) => {},
        // );
        //
        this.eventSub.onChannelRedemptionAdd(user.id, (eventSubEvent) => {
            //console.log('Got channel point redemption!', eventSubEvent);

            let message =
                'ChannelPoints Redemption: ' +
                eventSubEvent.rewardTitle +
                ' by ' +
                eventSubEvent.userName;
            if (eventSubEvent.input) {
                message += ': ' + eventSubEvent.input;
            }

            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    eventSubEvent.id,
                    eventSubEvent.broadcasterName,
                    eventSubEvent.userName,
                    TwitchChannelEventType.ChannelPointRedeem,
                    eventSubEvent.redemptionDate,
                    message,
                ),
            );
        });
        // this.eventSub.onChannelPollBegin(user.id, (eventSubEvent) => {});
        // this.eventSub.onChannelPollProgress(user.id, (eventSubEvent) => {});
        // this.eventSub.onChannelPollEnd(user.id, (eventSubEvent) => {});
        // this.eventSub.onChannelHypeTrainBegin(user.id, (eventSubEvent) => {});
        // this.eventSub.onChannelHypeTrainProgress(
        //     user.id,
        //     (eventSubEvent) => {},
        // );
        // this.eventSub.onChannelHypeTrainEnd(user.id, (eventSubEvent) => {});
        //
        // this.eventSub.onStreamOnline(user.id, (eventSubEvent) => {});
        // this.eventSub.onStreamOffline(user.id, (eventSubEvent) => {});
    }
    // FIXME: CONTINUE HERE
    private getChatMessageForChannelEvent(
        id: string,
        channelName: string,
        username: string,
        twitchChannelEventType: TwitchChannelEventType,
        date: Date,
        message: string,
    ): ChatMessage {
        return {
            id: id,
            messageType: ChatMessageType.ChannelEvent,
            username: username,
            channelName: channelName,
            client: this,
            date: date,
            color: '#000000',
            userIsBroadcaster: false,
            userIsMod: false,
            userIsSubscriber: false,
            userIsVip: false,
            message: message,
            emotes: new Map<string, string[]>(),
        };
    }

    joinChannel(channelName: string) {
        return this.chatClient.join(channelName);
    }

    leaveChannel(channelName: string) {
        return new Promise<void>((resolve) => {
            this.chatClient.part(channelName);
            resolve();
        });
    }

    private loadTokenData(): void {
        if (fs.existsSync(this.tokenFilePath)) {
            this.tokenData = JSON.parse(
                fs.readFileSync(this.tokenFilePath).toString(),
            );
        }
    }

    sendMessage(channelName: string, message: string): Promise<void> {
        return this.chatClient.say(channelName, message);
    }
}
