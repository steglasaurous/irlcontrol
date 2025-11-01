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
import { ChatMessageReceiveEvent } from '../../chat/events/chat-message-receive.event';
import { OnEvent } from '@nestjs/event-emitter';
import { PlainWebsocketService } from '../plain-websocket/plain-websocket.service';
@WebSocketGateway({ cors: '^*' })
export class MainGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;
    constructor(
        private streamStatusManager: StreamStatusManagerService,
        private chatManager: ChatManagerService,
        private irlStatsService: IrlStatsService,
        private configService: ConfigService,

        // FIXME: Sticking this here for a quick way to instantiate the plain websocket service but this should be moved
        // to a factory or something.
        private plainWebsocketService: PlainWebsocketService,
    ) {
        streamStatusManager
            .getStreamChangeObservable()
            .subscribe((streamStatus: StreamStatus) => {
                this.server.emit('streamStatus', streamStatus);
            });
        streamStatusManager.start();

        irlStatsService.irlUpdates$.subscribe((irlStats) => {
            this.server.emit('irlStats', irlStats);
            console.log(irlStats);
        });
    }

    @SubscribeMessage('lastReceivedMessage')
    lastReceivedMessage(@MessageBody('id') id: string): any[] {
        return this.chatManager
            .getMessagesSince(id)
            .map((chatMessage: ChatMessage) => {
                const emoteArray = Array.from(chatMessage.emotes);
                return {
                    id: chatMessage.id,
                    username: chatMessage.username,
                    channelName: chatMessage.channelName,
                    message: chatMessage.message,
                    date: chatMessage.date,
                    color: chatMessage.color,
                    userIsBroadcaster: chatMessage.userIsBroadcaster,
                    userIsMod: chatMessage.userIsMod,
                    userIsSubscriber: chatMessage.userIsSubscriber,
                    userIsVip: chatMessage.userIsVip,
                    emotes: emoteArray,
                };
            });
    }

    handleConnection(client: Socket, ...args: any[]): any {
        client.emit('config', {
            twitchChannel: this.configService.get('chat.twitch.channel'),
        });
    }

    @OnEvent(ChatMessageReceiveEvent.name)
    handleChatMessage(chatMessageReceiveEvent: ChatMessageReceiveEvent) {
        const chatMessage = chatMessageReceiveEvent.chatMessage;
        // Because apparently JSON.stringify won't encode maps, we need to turn it into an array first.
        const emoteArray = Array.from(chatMessage.emotes);
        const chatMessageOutput = {
            id: chatMessage.id,
            username: chatMessage.username,
            channelName: chatMessage.channelName,
            message: chatMessage.message,
            date: chatMessage.date,
            color: chatMessage.color,
            userIsBroadcaster: chatMessage.userIsBroadcaster,
            userIsMod: chatMessage.userIsMod,
            userIsSubscriber: chatMessage.userIsSubscriber,
            userIsVip: chatMessage.userIsVip,
            emotes: emoteArray,
        };
        this.server.emit('chatMessage', chatMessageOutput);
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(@MessageBody('message') message: string) {
        console.log('Sending message', message);
        // FIXME: This lets anyone connecting to websocket send a twitch message as the authenticated user.
        //   Need to secure this.
        const chatClient = this.chatManager.getChatClients()[0];
        await chatClient.sendMessage(chatClient.getDefaultChannel(), message);
    }
}
