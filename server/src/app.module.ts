import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { StreamStatusModule } from './modules/stream-status/stream-status.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ChatModule } from './modules/chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import { IrlStatsModule } from './modules/irl-stats/irl-stats.module';
import configuration from './configuration';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {ServeStaticModule} from "@nestjs/serve-static";
import * as fs from 'fs';
import { join } from 'path';

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
        EventEmitterModule.forRoot(),
        ServeStaticModule.forRoot({
            rootPath: fs.existsSync(join(__dirname, '..', 'public')) ? join(__dirname, '..', 'public') : join(__dirname, 'public')
        })
    ],
    providers: [AppService],
})
export class AppModule {}
