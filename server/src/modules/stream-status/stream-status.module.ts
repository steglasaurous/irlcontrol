import { Module } from '@nestjs/common';
import { StreamStatusManagerService } from './services/stream-status-manager.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { SlsStreamStatusClient } from './clients/sls-stream-status.client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StreamSource, StreamSourceType } from '../../configuration';
import { RtmpStreamStatusClient } from './clients/rtmp-stream-status.client';
import { IrlStatsModule } from '../irl-stats/irl-stats.module';
import { IrlStatsService } from '../irl-stats/services/irl-stats.service';
import { BelaboxStreamStatusClient } from './clients/belabox-stream-status.client';

@Module({
    imports: [HttpModule, ConfigModule, IrlStatsModule],
    providers: [
        {
            provide: StreamStatusManagerService,
            useFactory: (
                httpService: HttpService,
                configService: ConfigService,
                irlStatsService: IrlStatsService,
            ) => {
                const manager = new StreamStatusManagerService(
                    irlStatsService,
                    configService.get<string>('locationStreamStatsLogFile'),
                );
                const streamSources =
                    configService.get<StreamSource[]>('streamSources');

                if (streamSources && streamSources.length > 0) {
                    streamSources.forEach((streamSource: StreamSource) => {
                        switch (streamSource.type) {
                            case StreamSourceType.belabox:
                                manager.addStreamStatusClient(
                                    new BelaboxStreamStatusClient(
                                        httpService,
                                        streamSource.url,
                                        streamSource.name,
                                        streamSource.key,
                                    ),
                                );
                                break;
                            case StreamSourceType.sls:
                                manager.addStreamStatusClient(
                                    new SlsStreamStatusClient(
                                        httpService,
                                        streamSource.url,
                                        streamSource.name,
                                        streamSource.key,
                                    ),
                                );
                                break;
                            case StreamSourceType.rtmp:
                                manager.addStreamStatusClient(
                                    new RtmpStreamStatusClient(
                                        httpService,
                                        streamSource.url,
                                        streamSource.name,
                                    ),
                                );
                                break;
                            default:
                                throw new Error(
                                    'Invalid stream source type specified. Check your streamSources config. Valid types are sls, rtmp.',
                                );
                        }
                    });
                }

                return manager;
            },
            inject: [HttpService, ConfigService, IrlStatsService],
        },
    ],
    exports: [StreamStatusManagerService],
})
export class StreamStatusModule {}
