import { AbstractStreamStatusClient } from './abstract-stream-status.client';
import { StreamStatus } from '../models/stream-status';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

@Injectable()
export class RtmpStreamStatusClient extends AbstractStreamStatusClient {
    private latestStreamStatus: StreamStatus = new StreamStatus(
        '',
        0,
        false,
        Date.now(),
        undefined,
    );

    private logger: Logger = new Logger(RtmpStreamStatusClient.name);

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
                    const parser = new XMLParser();
                    const obj = parser.parse(response.data);

                    if (obj.rtmp.server.application.live.stream) {
                        if (obj.rtmp.bw_in == 0) {
                            this.latestStreamStatus = new StreamStatus(
                                this.streamName,
                                0,
                                false,
                                Date.now(),
                                null,
                            );
                        } else {
                            // We're live
                            this.latestStreamStatus = new StreamStatus(
                                this.streamName,
                                Math.floor(parseInt(obj.rtmp.bw_in) / 1000),
                                true,
                                Date.now(),
                                null,
                            );
                        }
                    } else {
                        this.latestStreamStatus = new StreamStatus(
                            this.streamName,
                            0,
                            false,
                            Date.now(),
                            null,
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
