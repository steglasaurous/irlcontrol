import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild
} from '@angular/core';
import {WebsocketService} from "../websocket.service";
import {ChatMessage} from "../utils/chat-message.interface";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements AfterViewChecked {
  chatMessages: ChatMessage[] = [];

  lastDisplayedMessage = 0;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(private websocketService: WebsocketService) {
    websocketService.chatMessage$.subscribe((chatMessage: ChatMessage) => {
      this.chatMessages.push(chatMessage);
    });

    websocketService.onConnect$.subscribe((socket) => {
      socket.emit('lastReceivedMessage', { id: this.chatMessages.length }, (chatMessages: ChatMessage[]) => {
        this.chatMessages = this.chatMessages.concat(chatMessages);
      });
    });
  }

  ngAfterViewChecked() {
    if (this.lastDisplayedMessage != this.chatMessages.length) {
      try {
        this.chatContainerRef.nativeElement.scrollTop = this.chatContainerRef.nativeElement.scrollHeight;
      } catch (e) {
        console.log('chatContainerRef scroll failed');
        // Do nothing?
      }
      this.lastDisplayedMessage = this.chatMessages.length;
    }
  }
}
