import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-video-preview',
  templateUrl: './video-preview.component.html',
  styleUrls: ['./video-preview.component.scss'],
})
export class VideoPreviewComponent {
  videoFeedbackSource: string = environment.videoFeedbackSource;
}
