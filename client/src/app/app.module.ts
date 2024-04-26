import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './containers/main/main.component';
import { StreamStatusComponent } from './components/stream-status/stream-status.component';
import { ChatComponent } from './chat/chat.component';
import { ChatMessageEmotesPipe } from './chat-message-emotes.pipe';
import { NgChartsModule } from 'ng2-charts';
import { StreamBitrateChartComponent } from './components/stream-bitrate-chart/stream-bitrate-chart.component';
import { IrlStatsComponent } from './components/irl-stats/irl-stats.component';
import { StatusOverlayComponent } from './containers/status-overlay/status-overlay.component';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    StreamStatusComponent,
    ChatComponent,
    ChatMessageEmotesPipe,
    StreamBitrateChartComponent,
    IrlStatsComponent,
    StatusOverlayComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
