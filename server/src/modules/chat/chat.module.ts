import { Module } from '@nestjs/common';
import { ChatManagerService } from './services/chat-manager.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitchChatClient } from './services/clients/twitch-chat.client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TwitchConfig } from '../../configuration';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'ChatClients',
            inject: [ConfigService, EventEmitter2],
            useFactory: (
                configService: ConfigService,
                eventEmitter: EventEmitter2,
            ) => {
                const twitchConfig =
                    configService.get<TwitchConfig>('chat.twitch');

                const twitchClient = new TwitchChatClient(
                    twitchConfig.appClientId,
                    twitchConfig.appClientSecret,
                    twitchConfig.tokenFile,
                    twitchConfig.channel,
                    eventEmitter,
                );

                return [twitchClient];
            },
        },
        ChatManagerService,
    ],
    exports: [ChatManagerService],
})
export class ChatModule {}
