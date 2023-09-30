import { Injectable, Logger } from '@nestjs/common';
import { AbstractStreamStatusClient } from '../clients/abstract-stream-status.client';
import { StreamStatus } from '../models/stream-status';
import { Observable, Subject } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IrlStatsService } from '../../irl-stats/services/irl-stats.service';
import * as fs from 'fs';

@Injectable()
export class StreamStatusManagerService {
    private streamStatusClients: AbstractStreamStatusClient[] = [];

    private streamChangeObservable$: Subject<StreamStatus> =
        new Subject<StreamStatus>();

    private running = false;

    private logger: Logger = new Logger(StreamStatusManagerService.name);

    private logFile = '/server/public/stats.txt';

    constructor(private irlStatsService: IrlStatsService) {}
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
            const streamStatuses: StreamStatus[] = [];
            this.streamStatusClients.forEach((client) => {
                client.updateStreamStatus().catch((err) => {
                    this.logger.warn(
                        'Error running updateStreamStatus for client',
                        { streamInfo: client.getStreamStatus(), err: err },
                    );
                });
                this.streamChangeObservable$.next(client.getStreamStatus());
                streamStatuses.push(client.getStreamStatus());
            });

            // Write this out to a file for later use.
            const output = {
                irlStat: this.irlStatsService.irlStat,
                streamStatuses: streamStatuses,
            };
            fs.writeFileSync(this.logFile, JSON.stringify(output) + '\n', {
                flag: 'a',
            });
            console.log(output);
        }
    }
}
