import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../../assets/models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationData = new BehaviorSubject<any>(null);
  notification$ = this.notificationData.asObservable();

  showNotification(data: Notification) {
    this.notificationData.next(data);

    setTimeout(() => {
      this.notificationData.next(null);
    }, data?.duration || 3000);
  }
}
