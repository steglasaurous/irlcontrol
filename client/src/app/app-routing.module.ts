import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MainComponent} from "./containers/main/main.component";
import {StatusOverlayComponent} from "./containers/status-overlay/status-overlay.component";

const routes: Routes = [
  {
    path: '', component: MainComponent
  },
  {
    path: 'status', component: StatusOverlayComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
