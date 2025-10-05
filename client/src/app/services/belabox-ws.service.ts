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
  private url = environment.belaboxWsUrl;
  private belaboxPassword = environment.belaboxPassword;

  private ws?: WebSocket;

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
    this.getNewWebsocket();
  }

  onOpen() {
    console.log('Connection opened to belabox - authenticating...');
    if (this.ws instanceof WebSocket) {
      this.ws.send(
        JSON.stringify({
          auth: { password: this.belaboxPassword, persistent_token: false },
        }),
      );
      this.keepaliveIntervalHandle = setInterval(() => {
        if (this.ws instanceof WebSocket) {
          this.ws.send(JSON.stringify({ keepalive: null }));
        }
      }, 10000);
    }
  }

  onMessage(wsMessage: MessageEvent<any>) {
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
  }

  onError(e: Event) {
    console.log('Belabox ws error', e);
  }

  onClose(e: CloseEvent) {
    console.log('Belabox ws connection closed.');
    clearInterval(this.keepaliveIntervalHandle);

    if (this.ws instanceof WebSocket) {
      this.ws.removeEventListener('open', this.onOpen.bind(this));
      this.ws.removeEventListener('message', this.onMessage.bind(this));
      this.ws.removeEventListener('error', this.onError.bind(this));
      this.ws.removeEventListener('close', this.onClose.bind(this));
      delete this.ws;
    }
    setTimeout(() => {
      this.getNewWebsocket();
    }, 3000);
  }

  getNewWebsocket() {
    console.log('Creating new belabox ws instance');
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));
    this.ws.addEventListener('error', this.onError.bind(this));
    this.ws.addEventListener('close', this.onClose.bind(this));
  }
}
