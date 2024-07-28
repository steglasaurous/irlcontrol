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

    private sentMessageCounter = 0;

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
                    // logger: { minLevel: 'DEBUG' },
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

        this.eventSub.onChannelRaidTo(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.raidedBroadcasterName,
                    eventSubEvent.raidingBroadcasterName,
                    TwitchChannelEventType.Raid,
                    new Date(),
                    'Raided by ' + eventSubEvent.raidingBroadcasterName + '!!',
                ),
            );
        });

        this.eventSub.onChannelCheer(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.userName,
                    TwitchChannelEventType.Cheer,
                    new Date(),
                    `${eventSubEvent.userName} cheered ${eventSubEvent.bits} bits!`,
                ),
            );
        });
        //
        this.eventSub.onChannelSubscription(user.id, (eventSubEvent) => {
            let message = `${eventSubEvent.userName} just subscribed at tier ${eventSubEvent.tier}!`;
            if (eventSubEvent.isGift) {
                message = `${eventSubEvent.userName} just gifted a sub at tier ${eventSubEvent.tier}!`;
            }
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.userName,
                    TwitchChannelEventType.Subscription,
                    new Date(),
                    message,
                ),
            );
        });
        //
        this.eventSub.onChannelSubscriptionGift(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.gifterName,
                    TwitchChannelEventType.Subscription,
                    new Date(),
                    `${eventSubEvent.gifterName} just gifted ${eventSubEvent.amount} tier ${eventSubEvent.tier} subs!`,
                ),
            );
        });
        this.eventSub.onChannelSubscriptionMessage(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.userName,
                    TwitchChannelEventType.Subscription,
                    new Date(),
                    `New sub message from ${eventSubEvent.userName}: ${eventSubEvent.messageText}`,
                ),
            );
        });
        //
        this.eventSub.onChannelRedemptionAdd(user.id, (eventSubEvent) => {
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
        this.eventSub.onChannelPollBegin(user.id, (eventSubEvent) => {
            const pollChoices = eventSubEvent.choices
                .map((value) => {
                    return `${value.title}`;
                })
                .join(', ');
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.PollBegin,
                    new Date(),
                    `New chat poll started: ${eventSubEvent.title} - Choices: ${pollChoices}`,
                ),
            );
        });
        this.eventSub.onChannelPollProgress(user.id, (eventSubEvent) => {
            const pollChoices = eventSubEvent.choices
                .map((value) => {
                    return `${value.title}: ${value.totalVotes}`;
                })
                .join(', ');
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.PollProgress,
                    new Date(),
                    `Poll progress: ${pollChoices}`,
                ),
            );
        });
        this.eventSub.onChannelPollEnd(user.id, (eventSubEvent) => {
            const pollChoices = eventSubEvent.choices
                .map((value) => {
                    return `${value.title}: ${value.totalVotes}`;
                })
                .join(', ');
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.PollEnd,
                    new Date(),
                    `Poll progress: ${pollChoices}`,
                ),
            );
        });

        this.eventSub.onChannelHypeTrainBegin(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.HypeTrainBegin,
                    new Date(),
                    `Hypetrain starting at level ${eventSubEvent.level} at ${eventSubEvent.progress}%!`,
                ),
            );
        });
        this.eventSub.onChannelHypeTrainProgress(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    eventSubEvent.id,
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.HypeTrainProgress,
                    new Date(),
                    `Hypetrain progress: Level ${eventSubEvent.level} at ${eventSubEvent.progress}%!`,
                ),
            );
        });

        this.eventSub.onChannelHypeTrainEnd(user.id, (eventSubEvent) => {
            const contributors = eventSubEvent.topContributors
                .map((value) => {
                    return value.userName;
                })
                .join(', ');

            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    eventSubEvent.id,
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.HypeTrainEnd,
                    new Date(),
                    `Hypetrain ended: Level ${eventSubEvent.level} at ${eventSubEvent.total}%!  Top contributors: ${contributors}`,
                ),
            );
        });

        this.eventSub.onStreamOnline(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.StreamOnline,
                    new Date(),
                    `*** Stream ONLINE ***`,
                ),
            );
        });

        this.eventSub.onStreamOffline(user.id, (eventSubEvent) => {
            this.messages$.next(
                this.getChatMessageForChannelEvent(
                    Date.now().toString(),
                    eventSubEvent.broadcasterName,
                    eventSubEvent.broadcasterName,
                    TwitchChannelEventType.StreamOnline,
                    new Date(),
                    `*** Stream OFFLINE ***`,
                ),
            );
        });
    }

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
            twitchChannelEventType: twitchChannelEventType,
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

    getDefaultChannel(): string {
        return this.twitchChannel;
    }

    private loadTokenData(): void {
        if (fs.existsSync(this.tokenFilePath)) {
            this.tokenData = JSON.parse(
                fs.readFileSync(this.tokenFilePath).toString(),
            );
        }
    }

    async sendMessage(channelName: string, message: string): Promise<void> {
        await this.chatClient.say(channelName, message);
        this.sentMessageCounter++;

        // Emit this as a new message so it appears in history.
        this.messages$.next({
            id: 'SENT-' + this.sentMessageCounter,
            messageType: ChatMessageType.ChatMessage,
            username: this.twitchChannel, // Since the channel is generally the same name as the broadcaster, using it here.
            channelName: channelName,
            message: message,
            emotes: new Map<string, string[]>(),
            date: new Date(),
            color: '#ff00ff',
            client: this,
            userIsBroadcaster: true,
            userIsMod: false,
            userIsSubscriber: false,
            userIsVip: false,
        });
    }
}
