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
                    // FIXME: Hard-coded publish feed, should make this configurable.
                    if (obj.publishers['publish/live/feed1'] != undefined) {
                        this.latestStreamStatus = new StreamStatus(
                            this.streamName,
                            obj.publishers['publish/live/feed1'].bitrate ?? 0,
                            obj.status == 'ok',
                            Date.now(),
                            obj.publishers['publish/live/feed1'].rtt ?? -1,
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
