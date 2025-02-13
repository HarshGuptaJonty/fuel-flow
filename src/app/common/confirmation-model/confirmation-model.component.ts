import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirmation-model',
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './confirmation-model.component.html',
  styleUrl: './confirmation-model.component.scss'
})
export class ConfirmationModelComponent {

  constructor(
    public confirmationModelService: ConfirmationModelService
  ) { }

  onleftButtonClick() {
    this.confirmationModelService.onButtonClick.next('left');
  }

  onRightButtonClick() {
    this.confirmationModelService.onButtonClick.next('right');
  }
}
