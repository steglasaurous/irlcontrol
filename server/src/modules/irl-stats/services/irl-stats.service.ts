import { Inject, Injectable } from '@nestjs/common';
import { firstValueFrom, Subject } from 'rxjs';
import { IrlStats } from './irl-stats';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class IrlStatsService {
    irlStat: IrlStats;
    irlUpdates$: Subject<IrlStats> = new Subject<IrlStats>();
    lastUpdatedAt: number = 0;

    private running: boolean = true; // FIXME: Change to default to false and have some sort of trigger to turn it on?
    // Store as CSV so it's easy to append.  Don't have to worry about JSON structures, etc.

    private totalDistanceKm: number = 0;
    constructor(
        @Inject('RTIRL_PULL_KEY') private rtirlPullKey: string,
        private readonly httpService: HttpService,
    ) {
        if (!rtirlPullKey) {
            this.running = false;
        }
    }

    start() {
        this.running = true;
    }

    stop() {
        this.running = false;
    }

    @Cron(CronExpression.EVERY_5_SECONDS)
    async getUpdate() {
        if (this.running) {
            const response = await firstValueFrom(
                this.httpService.get(
                    `https://rtirl.com/api/pull?key=${this.rtirlPullKey}`,
                ),
            );
            if (this.lastUpdatedAt == response.data.updatedAt) {
                // No change, don't update.
                return;
            }
            this.lastUpdatedAt = response.data.updatedAt;

            let speedKph = (response.data.speed * 3.6) | 0;
            if (speedKph < 1) {
                speedKph = 0;
            }
            const speedMph = speedKph * 0.621371;

            if (this.irlStat !== undefined) {
                const delta = this.distanceInKmBetweenEarthCoordinates(
                    response.data.location.latitude,
                    response.data.location.longitude,
                    this.irlStat.latitude,
                    this.irlStat.longitude,
                );

                this.totalDistanceKm = this.totalDistanceKm + delta;
            }

            this.irlStat = {
                latitude: response.data.location.latitude,
                longitude: response.data.location.longitude,
                distanceKm: this.totalDistanceKm,
                distanceMiles: this.totalDistanceKm * 0.621371,
                speedKph: speedKph,
                speedMph: speedMph,
            };

            this.irlUpdates$.next(this.irlStat);

            // Note that because of GPS drift, different gps points will keep comming even if
            // the subject is stationary. Each new gps point will be considered as subject is moving
            // and it will get added to the total distance. Each addition will be tiny but it will
            // addup over time and can become visible. So, at the end the shown distance might look
            // slightly more than expected.
        }
    }

    private degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    private distanceInKmBetweenEarthCoordinates(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ) {
        const earthRadiusKm = 6371;

        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);

        lat1 = this.degreesToRadians(lat1);
        lat2 = this.degreesToRadians(lat2);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) *
                Math.sin(dLon / 2) *
                Math.cos(lat1) *
                Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
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
