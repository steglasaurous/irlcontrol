import { Injectable } from '@angular/core';
import {io, Socket} from "socket.io-client";
import { environment } from '../environments/environment';
import {Subject} from "rxjs";
import {StreamStatus} from "./utils/stream-status.interface";
import {ChatMessage} from "./utils/chat-message.interface";
import {ConfigMessage} from "./utils/config-message.interface";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket!: Socket;


  streamStatusSubject = new Subject<StreamStatus>();
  streamStatus$ = this.streamStatusSubject.asObservable();
  chatMessage$ = new Subject<ChatMessage>();
  config$ = new Subject<ConfigMessage>();

  // Fired when  a connection is made (or re-connection)
  onConnect$ = new Subject<Socket>();

  constructor() {
    this.socket = io(environment.wsUrl);

    this.socket.on('connect', () => {
      console.log('Connect event');
      this.onConnect$.next(this.socket);
    });

    this.socket.on('streamStatus', (newStreamStatus: StreamStatus) => {
      this.streamStatusSubject.next(newStreamStatus);
    });

    this.socket.on('chatMessage', (chatMessage: ChatMessage) => {
      console.log(chatMessage);
      // Try to turn the emotes list into a map.
      chatMessage.emotes = new Map<string, string[]>(chatMessage.emotes);
      this.chatMessage$.next(chatMessage);
    });

    this.socket.on('config', (config: ConfigMessage) => {
      this.config$.next(config);
    });
  }
}
