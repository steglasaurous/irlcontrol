import { Injectable, Logger } from '@nestjs/common';
import { AbstractStreamStatusClient } from '../clients/abstract-stream-status.client';
import { StreamStatus } from '../models/stream-status';
import { Observable, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StreamStatusManagerService {
    private streamStatusClients: AbstractStreamStatusClient[] = [];

    private streamChangeObservable$: Subject<StreamStatus> =
        new Subject<StreamStatus>();

    private running = false;

    private logger: Logger = new Logger(StreamStatusManagerService.name);

    public addStreamStatusClient(client: AbstractStreamStatusClient) {
        this.streamStatusClients.push(client);
    }

    public start() {
        this.running = true;
    }

    public stop() {
        this.running = false;
    }

    public getStreamChangeObservable(): Observable<StreamStatus> {
        return this.streamChangeObservable$;
    }

    @Cron(CronExpression.EVERY_SECOND)
    handleCron() {
        if (this.running) {
            this.streamStatusClients.forEach((client) => {
                client.updateStreamStatus().catch((err) => {
                    this.logger.warn(
                        'Error running updateStreamStatus for client',
                        { streamInfo: client.getStreamStatus(), err: err },
                    );
                });
                this.streamChangeObservable$.next(client.getStreamStatus());
            });
        }
    }
}
