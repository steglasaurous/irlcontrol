import { Component } from '@angular/core';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-status-overlay',
  templateUrl: './status-overlay.component.html',
  styleUrls: ['./status-overlay.component.scss']
})
export class StatusOverlayComponent {
  constructor(router: ActivatedRoute) {
  }
}
