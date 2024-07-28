import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StreamStatus } from '../utils/stream-status.interface';
import { environment } from '../../environments/environment';

/**
 * Attempts to connect to a local belabox service.  If it exists, it provides its own StreamStatus updates
 * for each available connection, with connection status updates.
 */
@Injectable({
  providedIn: 'root',
})
export class BelaboxWsService {
  private url = 'ws://belabox.local'; // FIXME: Should move this to environment
  private belaboxPassword = environment.belaboxPassword;

  private ws!: WebSocket;

  private isActivated: boolean = false;

  private streamStatusSubject = new Subject<StreamStatus>();
  public streamStatus$ = this.streamStatusSubject.asObservable();

  private interfaceStatuses: Map<string, StreamStatus> = new Map<
    string,
    StreamStatus
  >();
  private keepaliveIntervalHandle?: number;

  constructor() {}

  getIsActivated(): boolean {
    return this.isActivated;
  }

  connect() {
    this.isActivated = true;

    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('open', () => {
      console.log('Connection opened to belabox - authenticating...');
      this.ws.send(
        JSON.stringify({
          auth: { password: this.belaboxPassword, persistent_token: false },
        }),
      );
      this.keepaliveIntervalHandle = setInterval(() => {
        this.ws.send(JSON.stringify({ keepalive: null }));
      }, 10000);
    });
    this.ws.addEventListener('message', (wsMessage) => {
      const messageObj = JSON.parse(wsMessage.data.toString());
      if (messageObj.hasOwnProperty('netif')) {
        for (const property in messageObj.netif) {
          const ip = messageObj.netif[property].ip;
          const tp = Math.round(
            (parseInt(messageObj.netif[property].tp) * 8) / 1024,
          );

          // Construct a streamStatus object for this.
          this.interfaceStatuses.set(property, {
            connected: true,
            rtt: undefined,
            bitrate: tp,
            streamName: ip,
            timestamp: Date.now(),
            streamSourceType: 'belabox-local',
          } as StreamStatus);
        }
        // Go through connectedInterfaces to see if any are missing.  Remove and log the ones that are.
        this.interfaceStatuses.forEach((interfaceStatus, ifname) => {
          if (!messageObj.netif.hasOwnProperty(ifname)) {
            this.interfaceStatuses.set(ifname, {
              connected: false,
              rtt: undefined,
              bitrate: 0,
              streamName: interfaceStatus.streamName,
              timestamp: Date.now(),
              streamSourceType: 'belabox-local',
            } as StreamStatus);
            console.log(ifname + ' is down');
          }
        });

        // Emit all statuses
        this.interfaceStatuses.forEach((interfaceStatus) => {
          this.streamStatusSubject.next(interfaceStatus);
        });
      }
    });

    this.ws.addEventListener('error', (e) => {
      console.log('belabox ws error', e);
    });
    this.ws.addEventListener('close', (e) => {
      console.log('belabox connection closed', e);
    });
  }
}
