import { AbstractStreamStatusClient } from './abstract-stream-status.client';
import { Injectable, Logger } from '@nestjs/common';
import { StreamStatus } from '../models/stream-status';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class BelaboxStreamStatusClient extends AbstractStreamStatusClient {
    private latestStreamStatus: StreamStatus = new StreamStatus(
        '',
        0,
        false,
        Date.now(),
        undefined,
    );
    private logger: Logger = new Logger(BelaboxStreamStatusClient.name);
    constructor(
        private httpService: HttpService,
        private statusUrl: string,
        private streamName: string,
        private key: string,
    ) {
        super();
    }
    getStreamStatus(): StreamStatus {
        return this.latestStreamStatus;
    }

    updateStreamStatus(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.httpService.get(this.statusUrl).subscribe({
                next: (response) => {
                    const obj = response.data;
                    if (obj.publishers[this.key] != undefined) {
                        this.latestStreamStatus = new StreamStatus(
                            this.streamName,
                            obj.publishers[this.key].bitrate ?? 0,
                            obj.publishers[this.key].connected,
                            Date.now(),
                            obj.publishers[this.key].rtt ?? -1,
                        );
                    } else {
                        this.latestStreamStatus = new StreamStatus(
                            this.streamName,
                            0,
                            false,
                            Date.now(),
                            -1,
                        );
                    }
                    resolve(true);
                },
                error: (err) => {
                    this.logger.warn('Axios request failed', {
                        context: BelaboxStreamStatusClient.name,
                        err: err,
                    });
                    reject(err);
                },
            });
        });
    }
}
