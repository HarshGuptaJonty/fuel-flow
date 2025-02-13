import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './common/notification/notification.component';
import { ConfirmationModelComponent } from "./common/confirmation-model/confirmation-model.component";

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NotificationComponent,
    ConfirmationModelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
