import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

const API_VERSION = '0.1';

interface StreamerSession {
    socket: Socket;
    challenge: string;
    salt: string;
    identified: boolean;
    requestId: number;
    clientCompletions: Map<number, (data: any) => void>;
    previewQueues: Array<(preview: Buffer) => void>;
}

interface AuthenticationData {
    challenge: string;
    salt: string;
}

interface IdentifyMessage {
    authentication: string;
}

interface EventMessage {
    data: {
        [key: string]: any;
    };
}

interface ResponseMessage {
    id: number;
    [key: string]: any;
}

interface PreviewMessage {
    preview: string;
}

@Injectable()
@WebSocketGateway({
    path: '/',
    cors: true,
    port: 2345,
})
export class StreamerGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private logger = new Logger('StreamerGateway');
    private streamers = new Map<string, StreamerSession>();
    private password: string;

    constructor() {
        // Get password from environment or configuration
        this.password = process.env.STREAMER_PASSWORD || 'default-password';
    }

    async handleConnection(socket: Socket) {
        this.logger.log(`Streamer connected: ${socket.id}`);

        const challenge = this.generateRandomString();
        const salt = this.generateRandomString();

        // Initialize session
        this.streamers.set(socket.id, {
            socket,
            challenge,
            salt,
            identified: false,
            requestId: 0,
            clientCompletions: new Map(),
            previewQueues: [],
        });

        // Send hello message
        await this.sendToStreamer(socket, {
            hello: {
                apiVersion: API_VERSION,
                authentication: {
                    challenge,
                    salt,
                },
            },
        });
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Streamer disconnected: ${socket.id}`);
        this.streamers.delete(socket.id);
    }

    @SubscribeMessage('identify')
    async handleIdentify(
        @MessageBody() data: IdentifyMessage,
        @ConnectedSocket() socket: Socket,
    ) {
        const session = this.streamers.get(socket.id);
        if (!session) {
            throw new WsException('Session not found');
        }

        let result: any;

        if (session.identified) {
            result = { alreadyIdentified: {} };
        } else if (data.authentication === this.hashPassword(session)) {
            session.identified = true;
            result = { ok: {} };
        } else {
            session.identified = false;
            result = { wrongPassword: {} };
        }

        await this.sendToStreamer(socket, {
            identified: {
                result,
            },
        });
    }

    @SubscribeMessage('event')
    async handleEvent(
        @MessageBody() data: EventMessage,
        @ConnectedSocket() socket: Socket,
    ) {
        const session = this.streamers.get(socket.id);
        if (!session?.identified) {
            return;
        }

        for (const [kind, eventData] of Object.entries(data.data)) {
            if (kind === 'log') {
                this.logger.log(`[Streamer Log] ${eventData.entry}`);
            } else {
                this.logger.debug(`Ignoring event: ${kind}`, eventData);
            }
        }
    }

    @SubscribeMessage('response')
    async handleResponse(
        @MessageBody() data: ResponseMessage,
        @ConnectedSocket() socket: Socket,
    ) {
        const session = this.streamers.get(socket.id);
        if (!session?.identified) {
            return;
        }

        try {
            const requestId = data.id;
            const completion = session.clientCompletions.get(requestId);
            if (completion) {
                completion(data);
                session.clientCompletions.delete(requestId);
            }
        } catch (error) {
            this.logger.error('Error handling response:', error);
        }
    }

    @SubscribeMessage('preview')
    async handlePreview(
        @MessageBody() data: PreviewMessage,
        @ConnectedSocket() socket: Socket,
    ) {
        const session = this.streamers.get(socket.id);
        if (!session?.identified) {
            return;
        }

        const preview = Buffer.from(data.preview, 'base64');

        // Send to all preview queues
        for (const queue of session.previewQueues) {
            try {
                queue(preview);
            } catch (error) {
                this.logger.error('Error sending preview:', error);
            }
        }
    }

    @SubscribeMessage('ping')
    async handlePing(@ConnectedSocket() socket: Socket) {
        await this.sendToStreamer(socket, {
            pong: {},
        });
    }

    // Helper methods
    private async sendToStreamer(socket: Socket, message: any) {
        socket.emit('message', message);
    }

    async sendRequestToStreamer(
        socketId: string,
        requestId: number,
        data: any,
    ): Promise<any> {
        const session = this.streamers.get(socketId);
        if (!session?.identified) {
            throw new Error('Streamer not connected or not identified');
        }

        return new Promise((resolve, reject) => {
            // Store the completion handler
            session.clientCompletions.set(requestId, resolve);

            // Send the request
            this.sendToStreamer(session.socket, {
                request: {
                    id: requestId,
                    data,
                },
            });

            // Set timeout
            setTimeout(() => {
                if (session.clientCompletions.has(requestId)) {
                    session.clientCompletions.delete(requestId);
                    reject(new Error('Request timeout'));
                }
            }, 30000); // 30 second timeout
        });
    }

    getNextId(socketId: string): number {
        const session = this.streamers.get(socketId);
        if (!session) {
            throw new Error('Session not found');
        }
        session.requestId += 1;
        return session.requestId;
    }

    async addPreviewReader(
        socketId: string,
        callback: (preview: Buffer) => void,
    ) {
        const session = this.streamers.get(socketId);
        if (!session?.identified) {
            throw new Error('Streamer not connected or not identified');
        }

        session.previewQueues.push(callback);

        // Start preview if this is the first reader
        if (session.previewQueues.length === 1) {
            const requestId = this.getNextId(socketId);
            await this.sendRequestToStreamer(socketId, requestId, {
                startPreview: {},
            });
        }
    }

    async removePreviewReader(
        socketId: string,
        callback: (preview: Buffer) => void,
    ) {
        const session = this.streamers.get(socketId);
        if (!session) {
            return;
        }

        const index = session.previewQueues.indexOf(callback);
        if (index > -1) {
            session.previewQueues.splice(index, 1);
        }

        // Stop preview if no more readers
        if (session.previewQueues.length === 0 && session.identified) {
            const requestId = this.getNextId(socketId);
            await this.sendRequestToStreamer(socketId, requestId, {
                stopPreview: {},
            });
        }
    }

    private generateRandomString(): string {
        return randomBytes(64).toString('hex');
    }

    private hashPassword(session: StreamerSession): string {
        // First hash: password + salt
        const firstHash = createHash('sha256')
            .update(this.password + session.salt)
            .digest('base64');

        // Second hash: firstHash + challenge
        return createHash('sha256')
            .update(firstHash + session.challenge)
            .digest('base64');
    }

    // Get authenticated streamers (useful for client connections)
    getAuthenticatedStreamers(): string[] {
        return Array.from(this.streamers.entries())
            .filter(([_, session]) => session.identified)
            .map(([socketId, _]) => socketId);
    }

    // Check if a streamer is authenticated
    isStreamerAuthenticated(socketId: string): boolean {
        const session = this.streamers.get(socketId);
        return session?.identified || false;
    }
}
