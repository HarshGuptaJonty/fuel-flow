import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../../assets/models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationData = new BehaviorSubject<any>(null);
  notification$ = this.notificationData.asObservable();

  color = {
    green: '#3A7D44',
    red: '#ff0000',
    yellow: '#FBA518'
  }
  timeoutId: any;

  showNotification(data: Notification) {
    this.notificationData.next(data);

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.notificationData.next(null);
    }, data?.duration || 3000);
  }

  loggedOut() {
    this.showNotification({
      heading: 'Logged Out Successfully.',
      duration: 5000,
      leftBarColor: this.color.green
    });
  }

  notAuthorized() {
    this.showNotification({
      heading: 'Not Authorized.',
      message: 'Please login again.',
      duration: 5000,
      leftBarColor: this.color.red
    });
  }

  somethingWentWrong() {
    this.showNotification({
      heading: 'Something Went Wrong!',
      message: 'Please Contact IT Support!',
      duration: 5000,
      leftBarColor: this.color.red
    });
  }
}
