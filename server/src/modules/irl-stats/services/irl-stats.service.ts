import { Inject, Injectable } from '@nestjs/common';
import * as RealtimeIRL from '../../../../node_modules/@rtirl/api/lib/index';
import { Subject } from 'rxjs';
import { IrlStats } from './irl-stats';

@Injectable()
export class IrlStatsService {
    private oldsessionID!: string;
    private totalDistance = 0.0;
    private gps = {
        old: { latitude: 0.0, longitude: 0.0 },
        new: { latitude: 0.0, longitude: 0.0 },
    };

    private lastSpeed = 0.0;

    irlUpdates$: Subject<IrlStats> = new Subject<IrlStats>();

    constructor(@Inject('RTIRL_PULL_KEY') private rtirlPullKey: string) {}

    start() {
        // FIXME: It seems importing RealtimeIRL causes a nodejs 'module not found' error.  The lib itself seems relatively straight forward, but not sure.
        // RealtimeIRL.forPullKey(this.rtirlPullKey).addLocationListener(
        //     ({ latitude, longitude }) => {
        //         this.gps.new.latitude = latitude;
        //         this.gps.new.longitude = longitude;
        //
        //         if (this.oldsessionID === undefined) {
        //             this.totalDistance = 0;
        //         } else {
        //             // We have new gps points. Let's calculate the delta distance using previously saved gps points.
        //             const delta = this.distanceInKmBetweenEarthCoordinates(
        //                 this.gps.new.latitude,
        //                 this.gps.new.longitude,
        //                 this.gps.old.latitude,
        //                 this.gps.old.longitude,
        //             );
        //             this.totalDistance = this.totalDistance + delta;
        //             //shifting new points to old for next update
        //             this.gps.old.latitude = latitude;
        //             this.gps.old.longitude = longitude;
        //
        //             this.irlUpdates$.next({
        //                 totalDistance: this.totalDistance,
        //                 speed: this.lastSpeed,
        //             });
        //             // Note that because of GPS drift, different gps points will keep comming even if
        //             // the subject is stationary. Each new gps point will be considered as subject is moving
        //             // and it will get added to the total distance. Each addition will be tiny but it will
        //             // addup over time and can become visible. So, at the end the shown distance might look
        //             // sligtly more than expected.
        //         }
        //     },
        // );
        //
        // RealtimeIRL.forPullKey(this.rtirlPullKey).addSessionIdListener(
        //     (sessionId) => {
        //         if (sessionId != this.oldsessionID) {
        //             this.oldsessionID = sessionId;
        //             this.resetVars();
        //         }
        //     },
        // );
        //
        // RealtimeIRL.forPullKey(this.rtirlPullKey).addSpeedListener((speed) => {
        //     this.lastSpeed = speed / 1000;
        //     this.irlUpdates$.next({
        //         totalDistance: this.totalDistance,
        //         speed: this.lastSpeed,
        //     });
        // });
    }

    degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }

    distanceInKmBetweenEarthCoordinates(
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

    resetVars(): void {
        // New session. Reset total distance
        this.totalDistance = 0;
        // Set starting point to the current point
        this.gps.old.latitude = this.gps.new.latitude;
        this.gps.old.longitude = this.gps.new.longitude;
    }
}
