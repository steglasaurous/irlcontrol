import { Module } from '@nestjs/common';
import { ChatManagerService } from './services/chat-manager.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwitchChatClient } from './services/clients/twitch-chat.client';
import { TwitchConfig } from '../../configuration';

@Module({
    imports: [ConfigModule],
    providers: [
        ChatManagerService,
        {
            provide: ChatManagerService,
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const chatManager = new ChatManagerService();
                // Disabling twitch chat as it's not currently being used.
                // const twitchConfig =
                //     configService.get<TwitchConfig>('chat.twitch');

                // const twitchClient = new TwitchChatClient(
                //     twitchConfig.appClientId,
                //     twitchConfig.appClientSecret,
                //     twitchConfig.tokenFile,
                //     twitchConfig.channel,
                // );
                //
                // chatManager.addChatClient(twitchClient);

                return chatManager;
            },
        },
    ],
    exports: [ChatManagerService],
})
export class ChatModule {}
