import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {environment} from '../../environments/environment';

export interface StreamerState {
  mic: string,
  recording: boolean,
  debugLogging: boolean,
  zoom: number,
  streaming: boolean,
  bitrate: string,
  scene: string
}

@Injectable({
  providedIn: 'root',
})
export class MoblinAssistantWsService {
  private url = environment.moblinAssistantWsUrl;
  private ws?: WebSocket;
  private isActivated: boolean = false;
  private streamerStateSubject = new Subject<StreamerState>();
  public streamerState$ = this.streamerStateSubject.asObservable();

  getIsActivated(): boolean {
    return this.isActivated;
  }

  connect() {
    this.isActivated = true;
    this.getNewWebsocket();
  }

  onOpen() {
    console.log('Connection opened to moblin assistant');
  }

  onMessage(wsMessage: MessageEvent<any>) {

    const messageObj = JSON.parse(wsMessage.data.toString());
    console.log(messageObj);
    if (messageObj.event == 'state') {
      this.streamerStateSubject.next(messageObj.data);
    }
  }

  onError(e: Event) {
    console.log('moblin-assistant ws error', e);
  }

  onClose(e: CloseEvent) {
    console.log('moblin-assistant ws connection closed.');

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
    console.log('Creating new moblin-assistant ws instance');
    this.ws = new WebSocket(this.url);
    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));
    this.ws.addEventListener('error', this.onError.bind(this));
    this.ws.addEventListener('close', this.onClose.bind(this));
  }
}
