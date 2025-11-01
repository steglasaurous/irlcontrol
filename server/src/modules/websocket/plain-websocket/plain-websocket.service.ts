import { WebSocket, WebSocketServer } from 'ws';
import { StreamStatusManagerService } from '../../stream-status/services/stream-status-manager.service';
import { StreamStatus } from '../../stream-status/models/stream-status';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PlainWebsocketService {
    private wss;

    constructor(private streamStatusManager: StreamStatusManagerService) {
        this.wss = new WebSocketServer({ port: 10000 });

        this.wss.on('connection', (ws) => {
            console.log('Connection to plain websocket service');

            ws.on('close', () => {
                console.log('Plain websocket connection closed');
            });
        });

        this.streamStatusManager
            .getStreamChangeObservable()
            .subscribe((streamStatus: StreamStatus) => {
                this.wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            event: 'streamStatus',
                            data: streamStatus,
                        }),
                    );
                });
            });
    }
}
