import { Component } from '@angular/core';
import {WebsocketService} from "../websocket.service";
import {Howl} from "howler";
import {Subject} from "rxjs";

export enum StreamState {
  Stable,
  Unstable,
  Disconnected
}

interface StreamStatus {
  streamName: string,
  bitrate: number,
  connected: boolean,
  timestamp: number,
  rtt?: number,
}
@Component({
  selector: 'app-stream-status',
  templateUrl: './stream-status.component.html',
  styleUrls: ['./stream-status.component.scss']
})
export class StreamStatusComponent {
  streamStateType = StreamState;
  streamStatusHistory: Map<string, StreamStatus[]> = new Map<string, StreamStatus[]>();
  maxStreamStatusLength = 30;

  streamStableMaxRtt = 1000;
  streamStableMinBitrate = 1000;

  streamStableSound: Howl = new Howl({
    src: ['assets/sounds/blip.flac']
  });

  streamUnstableSound: Howl = new Howl({
    src: ['assets/sounds/warning.m4a']
  });

  streamStatusChange$: Subject<StreamState> = new Subject<StreamState>();

  constructor(private websocketService: WebsocketService) {
    this.setupStreamStatusReceiver();
    this.setupStreamStateChangeNotifier();
  }

  setupStreamStateChangeNotifier() {
    this.streamStatusChange$.subscribe((state: StreamState) => {
      switch (state) {
        case StreamState.Stable:
          console.log('stable');
          this.streamStableSound.play();
          break;
        case StreamState.Unstable:
          console.log('unstable');
          this.streamUnstableSound.play();
          break;
        case StreamState.Disconnected:
          console.log('disconnected');
          this.streamUnstableSound.play();
          break;
      }
    });
  }

  setupStreamStatusReceiver() {
    this.websocketService.streamStatus$.subscribe((newStreamStatus: StreamStatus) => {
      // Get current stream state so we can compare, whether or not to emit a state change.
      const lastStreamStateResult = this.getLatestStreamStatus(newStreamStatus.streamName); // Could be empty?
      let lastStreamState: StreamStatus|undefined = undefined;
      if (lastStreamStateResult.length > 0) {
        lastStreamState = lastStreamStateResult.slice(-1)[0];
      }

      if (!this.streamStatusHistory.has(newStreamStatus.streamName)) {
        this.streamStatusHistory.set(newStreamStatus.streamName, []);
      }

      let streamStatusList = this.streamStatusHistory.get(newStreamStatus.streamName);
      if (streamStatusList != undefined) {
        streamStatusList.push(newStreamStatus);
        if (streamStatusList.length > this.maxStreamStatusLength) {
          streamStatusList.shift();
        }
      }

      // Check for state change.
      if (lastStreamState != undefined) {
        if (lastStreamState.connected != newStreamStatus.connected) {
          if (newStreamStatus.connected == false) {
            this.streamStatusChange$.next(StreamState.Disconnected);
          } else {
            this.streamStatusChange$.next(StreamState.Stable);
          }
        }
        if (lastStreamState.rtt != undefined && newStreamStatus.rtt != undefined) {
          if (lastStreamState.rtt > this.streamStableMaxRtt && newStreamStatus.rtt < this.streamStableMaxRtt) {
            this.streamStatusChange$.next(StreamState.Stable);
          } else if (lastStreamState.rtt < this.streamStableMaxRtt && newStreamStatus.rtt > this.streamStableMaxRtt) {
            this.streamStatusChange$.next(StreamState.Unstable);
          }
        } else {
          // Bitrate test for RTMP (since RTT isn't available)
          if (lastStreamState.bitrate > this.streamStableMinBitrate && newStreamStatus.bitrate < this.streamStableMinBitrate) {
            this.streamStatusChange$.next(StreamState.Unstable);
          } else if (lastStreamState.bitrate < this.streamStableMinBitrate && newStreamStatus.bitrate > this.streamStableMinBitrate) {
            this.streamStatusChange$.next(StreamState.Stable);
          }
        }
      }
    });
  }

  getLatestStreamStatus(streamNameFilter: string = ''): StreamStatus[] {
    let output: StreamStatus[] = [];
    this.streamStatusHistory.forEach((streamStatus, streamName) => {
      if ((streamNameFilter == '' || streamName == streamNameFilter) && streamStatus.length > 0) {
        output.push(streamStatus.slice(-1)[0]);
      }
    });

    return output;
  }

  getStreamState(streamName: string): StreamState {
    const lastStreamStateResult = this.getLatestStreamStatus(streamName); // Could be empty?
    let lastStreamState: StreamStatus|undefined = undefined;
    if (lastStreamStateResult.length > 0) {
      lastStreamState = lastStreamStateResult.slice(-1)[0];
      if (!lastStreamState.connected) {
        return StreamState.Disconnected;
      }

      if (lastStreamState.rtt != undefined) {
        if (lastStreamState.rtt > this.streamStableMaxRtt) {
          return StreamState.Unstable;
        } else {
          return StreamState.Stable;
        }
      } else {
        if (lastStreamState.bitrate < this.streamStableMinBitrate) {
          return StreamState.Unstable;
        }

        return StreamState.Stable;
      }
    }

    return StreamState.Disconnected;
  }
}
