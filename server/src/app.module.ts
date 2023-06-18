import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { StreamStatusModule } from './modules/stream-status/stream-status.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './modules/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { IrlStatsModule } from './modules/irl-stats/irl-stats.module';
import configuration from './configuration';

@Module({
    imports: [
        WebsocketModule,
        StreamStatusModule,
        ScheduleModule.forRoot(),
        ChatModule,
        ConfigModule.forRoot({
            load: [configuration],
        }),
        IrlStatsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
