import {
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {WebsocketService} from "../websocket.service";
import {ChatMessage} from "../utils/chat-message.interface";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  chatMessages: ChatMessage[] = [];

  lastDisplayedMessage = 0;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  twitchChatUrl!: SafeResourceUrl;
  constructor(private websocketService: WebsocketService, sanitizer: DomSanitizer) {
    websocketService.config$.subscribe((config) => {
      let url = new URL(window.location.href);
      this.twitchChatUrl = sanitizer.bypassSecurityTrustResourceUrl(`https://www.twitch.tv/embed/${config.twitchChannel}/chat?darkpopout&parent=${url.hostname}`);
    });
  }
}
