import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-entry-detail',
  imports: [
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './entry-detail.component.html',
  styleUrl: './entry-detail.component.scss'
})
export class EntryDetailComponent {

  constructor(
    public entryDetailModelService: EntryDetailModelService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  onClose() {
    this.entryDetailModelService.hideModel();
  }

  openDeliveryBoyProfile() {
    const deliveryBoy = this.entryDetailModelService.getDeliveryBoyData();
    if (deliveryBoy) {
      if (deliveryBoy.userId) {
        this.entryDetailModelService.hideModel();
        this.router.navigate(['/deliveryBoy'], { queryParams: { userId: deliveryBoy.userId } });
      } else {
        this.notificationService.showNotification({
          heading: 'Profile not setup.',
          message: deliveryBoy.fullName + "'s profile is not complete!",
          duration: 5000,
          leftBarColor: this.notificationService.color.yellow
        });
      }
    }
  }
}
