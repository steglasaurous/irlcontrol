import {
  Component,
} from '@angular/core';
import {MoblinAssistantWsService, StreamerState} from "../../services/moblin-assistant-ws.service";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
})
export class StatusBarComponent {
  protected moblinState: StreamerState = {
    mic: '',
    recording: false,
    debugLogging: false,
    zoom: 1,
    streaming: false,
    bitrate: '',
    scene: ''
  };

  private subscriptions: Subscription[] = [];

  protected correctMicDevice = 'AppleUSBAudioEngine:RØDE:Wireless GO II RX:244B177A:2 0';

  constructor(private moblinAssistantWsService: MoblinAssistantWsService) {
    if (!moblinAssistantWsService.getIsActivated()) {
      moblinAssistantWsService.connect();
    }
    this.subscriptions.push(this.moblinAssistantWsService.streamerState$.subscribe((state) => {
      this.moblinState = state;
      console.log(this.moblinState);
    }));

  }


}
