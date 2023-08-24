import { AbstractStreamStatusClient } from './abstract-stream-status.client';
import { StreamStatus } from '../models/stream-status';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SlsStreamStatusClient extends AbstractStreamStatusClient {
    private latestStreamStatus: StreamStatus = new StreamStatus(
        '',
        0,
        false,
        Date.now(),
        undefined,
    );

    private logger: Logger = new Logger(SlsStreamStatusClient.name);

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
                            obj.status == 'ok',
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
                    this.logger.debug(err);
                    reject(err);
                },
            });
        });
    }
}
