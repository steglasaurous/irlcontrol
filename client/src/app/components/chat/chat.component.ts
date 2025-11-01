import {
  AfterViewChecked,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { WebsocketService } from '../../websocket.service';
import { ChatMessage } from '../../utils/chat-message.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent implements AfterViewChecked {
  chatMessages: ChatMessage[] = [];

  lastDisplayedMessage = 0;
  @ViewChild('chatContainer') private chatContainerRef!: ElementRef;

  constructor(private websocketService: WebsocketService) {
    websocketService.chatMessage$.subscribe((chatMessage: ChatMessage) => {
      this.chatMessages.push(chatMessage);
    });

    // FIXME: Should probably move this to the websocket service. Should also rename the websocket service to something like 'irlcontrol-service'
    //   as it's specific to this server, not a generic websocket.
    websocketService.onConnect$.subscribe((socket) => {
      socket.emit(
        'lastReceivedMessage',
        { id: this.chatMessages.length },
        (chatMessages: ChatMessage[]) => {
          chatMessages.forEach((chatMessage) => {
            chatMessage.emotes = new Map<string, string[]>(chatMessage.emotes);
            this.chatMessages.push(chatMessage);
          });
        },
      );
    });
  }

  ngAfterViewChecked() {
    if (this.lastDisplayedMessage != this.chatMessages.length) {
      try {
        this.chatContainerRef.nativeElement.scrollTop =
          this.chatContainerRef.nativeElement.scrollHeight;
      } catch (e) {
        console.log('chatContainerRef scroll failed');
        // Do nothing?
      }
      this.lastDisplayedMessage = this.chatMessages.length;
    }
  }

  sendMessage(message: string) {
    this.websocketService.sendMessage(message);
  }
}
