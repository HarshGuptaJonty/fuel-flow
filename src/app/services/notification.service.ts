import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from '../../assets/models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationData = new BehaviorSubject<Notification[]>([]);
  notification$ = this.notificationData.asObservable();

  private notificationQueue: Notification[] = [];

  color = {
    green: '#3A7D44',
    red: '#ff0000',
    yellow: '#FBA518'
  }

  showNotification(data: Notification) {
    const id = new Date().getTime();
    data.id = id;
    this.notificationQueue.push(data);
    this.notificationData.next([...this.notificationQueue]);

    setTimeout(() => {
      this.removeNotification(id);
    }, data?.duration || 3000);
  }

  removeNotification(id: number) {
    this.notificationQueue = this.notificationQueue.filter((notification) => notification.id !== id);
    this.notificationData.next([...this.notificationQueue]);
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

  somethingWentWrong(code: string) {
    this.showNotification({
      heading: 'Something Went Wrong!',
      message: 'Please Contact IT Support!' + (code ? ' Code:' + code : ''),
      duration: 5000,
      leftBarColor: this.color.red
    });
  }

  transactionListRefreshed() {
    this.showNotification({
      heading: 'Transaction list refreshed.',
      duration: 5000,
      leftBarColor: this.color.green
    });
  }
}
