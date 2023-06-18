import { Module } from '@nestjs/common';
import { MainGateway } from './main/main.gateway';
import { StreamStatusModule } from '../stream-status/stream-status.module';
import { ChatModule } from '../chat/chat.module';
import { IrlStatsModule } from '../irl-stats/irl-stats.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [StreamStatusModule, ChatModule, IrlStatsModule, ConfigModule],
    providers: [MainGateway],
})
export class WebsocketModule {}
