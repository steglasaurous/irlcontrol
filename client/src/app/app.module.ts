import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainComponent } from './containers/main/main.component';
import { StreamStatusComponent } from './components/stream-status/stream-status.component';
import { ChatComponent } from './components/chat/chat.component';
import { ChatMessageEmotesPipe } from './chat-message-emotes.pipe';
import { StreamBitrateChartComponent } from './components/stream-bitrate-chart/stream-bitrate-chart.component';
import { IrlStatsComponent } from './components/irl-stats/irl-stats.component';
import { StatusOverlayComponent } from './containers/status-overlay/status-overlay.component';
import { VideoPreviewComponent } from './components/video-preview/video-preview.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

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
    VideoPreviewComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, CanvasJSAngularChartsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
