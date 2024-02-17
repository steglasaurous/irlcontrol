import { AbstractChatClient } from './abstract-chat.client';
import { Subject } from 'rxjs';
import { ChatMessage } from '../chat-message';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import * as fs from 'fs';
import { ChatClientConnectedEvent } from '../../events/chat-client-connected.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TwitchChatClient extends AbstractChatClient {
  messages$: Subject<ChatMessage> = new Subject<ChatMessage>();

  private authProvider: RefreshingAuthProvider;

  // Current token data
  private tokenData: any = undefined;

  private chatClient: ChatClient;

  private logger: Logger = new Logger(TwitchChatClient.name);

  constructor(
    @Inject('TWITCH_APP_CLIENT_ID') private twitchAppClientId: string,
    @Inject('TWITCH_APP_CLIENT_SECRET')
    private twitchAppClientSecret: string,
    private tokenFilePath: string,
    private twitchChannel: string,
    private eventEmitter: EventEmitter2,
  ) {
    super();
  }

  connect() {
    return new Promise<void>(async (resolve) => {
      if (this.tokenData == undefined) {
        this.loadTokenData();
      }

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
      await this.authProvider.addUserForToken(this.tokenData, ['chat']);

      this.chatClient = new ChatClient({
        authProvider: this.authProvider,
        channels: [this.twitchChannel],
      });

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
        async (channel: string, user: string, text: string, msg: any) => {
          this.messages$.next({
            id: msg.id,
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
    // FIXME: Add error handling for invalid JSON data, missing file, etc.
    this.tokenData = JSON.parse(fs.readFileSync(this.tokenFilePath).toString());
  }

  sendMessage(channelName: string, message: string): Promise<void> {
    return this.chatClient.say(channelName, message);
  }
}
