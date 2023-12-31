import {
    MessageBody,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { StreamStatusManagerService } from '../../stream-status/services/stream-status-manager.service';
import { StreamStatus } from '../../stream-status/models/stream-status';
import { Server, Socket } from 'socket.io';
import { ChatManagerService } from '../../chat/services/chat-manager.service';
import { ChatMessage } from '../../chat/services/chat-message';
import { IrlStatsService } from '../../irl-stats/services/irl-stats.service';
import { ConfigService } from '@nestjs/config';
@WebSocketGateway({ cors: '^*' })
export class MainGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;
    constructor(
        private streamStatusManager: StreamStatusManagerService,
        private chatManager: ChatManagerService,
        private irlStatsService: IrlStatsService,
        private configService: ConfigService,
    ) {
        streamStatusManager
            .getStreamChangeObservable()
            .subscribe((streamStatus: StreamStatus) => {
                this.server.emit('streamStatus', streamStatus);
            });
        streamStatusManager.start();

        chatManager
            .getMessagesObservable()
            .subscribe((chatMessage: ChatMessage) => {
                // Because apparently JSON.stringify won't encode maps, we need to turn it into an array first.
                const emoteArray = Array.from(chatMessage.emotes);
                const chatMessageOutput = {
                    ...chatMessage,
                    emotes: emoteArray,
                };

                this.server.emit('chatMessage', chatMessageOutput);
                console.log(chatMessage);
            });
        chatManager.connect();

        irlStatsService.irlUpdates$.subscribe((irlStats) => {
            this.server.emit('irlStats', irlStats);
            console.log(irlStats);
        });
    }

    @SubscribeMessage('lastReceivedMessage')
    lastReceivedMessage(@MessageBody('id') id: number): ChatMessage[] {
        return this.chatManager.getMessagesSince(id);
    }

    handleConnection(client: Socket, ...args: any[]): any {
        client.emit('config', {
            twitchChannel: this.configService.get('chat.twitch.channel'),
        });
    }
}
