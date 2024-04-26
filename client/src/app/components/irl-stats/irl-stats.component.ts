import {Component, OnInit} from '@angular/core';
import * as RealtimeIRL from '@rtirl/api';

@Component({
  selector: 'app-irl-stats',
  templateUrl: './irl-stats.component.html',
  styleUrls: ['./irl-stats.component.scss']
})
export class IrlStatsComponent implements OnInit {
  oldsessionID!: string;
  totalDistance = 0.0;
  gps = { old: { latitude: 0.0, longitude: 0.0 }, new: { latitude: 0.0, longitude: 0.0 } };

  totalDistanceString = '';

  ngOnInit(): void {

  }

  degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1: number, lon1: number, lat2: number, lon2: number) {
    let earthRadiusKm = 6371;

    let dLat = this.degreesToRadians(lat2 - lat1);
    let dLon = this.degreesToRadians(lon2 - lon1);

    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);

    let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  resetVars(): void {
    // New session. Reset total distance
    this.totalDistance = 0;
    // Set starting point to the current point
    this.gps.old.latitude  = this.gps.new.latitude;
    this.gps.old.longitude = this.gps.new.longitude;
  }
}
