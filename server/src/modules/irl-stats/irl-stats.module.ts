import { Module } from '@nestjs/common';
import { IrlStatsService } from './services/irl-stats.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Rtirl } from '../../configuration';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [ConfigModule, HttpModule],
    providers: [
        IrlStatsService,
        {
            provide: 'RTIRL_PULL_KEY',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return configService.get<Rtirl>('rtirl').pullKey;
            },
        },
    ],
    exports: [IrlStatsService],
})
export class IrlStatsModule {}
