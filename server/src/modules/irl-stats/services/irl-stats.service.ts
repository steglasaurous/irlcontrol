import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, Subject } from 'rxjs';
import { IrlStats } from './irl-stats';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class IrlStatsService {
    irlStat: IrlStats;
    irlUpdates$: Subject<IrlStats> = new Subject<IrlStats>();

    private running: boolean = true; // FIXME: Change to default to false and have some sort of trigger to turn it on?
    // Store as CSV so it's easy to append.  Don't have to worry about JSON structures, etc.

    constructor(
        @Inject('RTIRL_PULL_KEY') private rtirlPullKey: string,
        private readonly httpService: HttpService,
    ) {}

    start() {
        this.running = true;
    }

    stop() {
        this.running = false;
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async getUpdate() {
        if (this.running) {
            console.log(`https://rtirl.com/api/pull?key=${this.rtirlPullKey}`);
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://rtirl.com/api/pull?key=${this.rtirlPullKey}`,
                ),
            );

            this.irlStat = {
                latitude: response.data.location.latitude,
                longitude: response.data.location.longitude,
            };
        }
    }
}

/*
{
   "accuracy":5.408999919891357,  // meters
   "altitude":{
      "EGM96":3.5973978207728656, // meters
      "WGS84":-29.197977916731165 // meters
   },
   "heading":206.37741088867188,  // degrees
   "location":{
      "latitude":40.7047389,      // degrees
      "longitude":-74.0171302     // degrees
   },
   "reportedAt":1629924573000,    // milliseconds since epoch
   "speed":0.6116824746131897,    // meters per second
   "updatedAt":1629924573283      // milliseconds since epoch
}
 */
