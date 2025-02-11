import { Injectable } from '@angular/core';
import { child, Database, get, ref, set } from '@angular/fire/database';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private db: Database,
    private notificationService: NotificationService
  ) { }

  async getData(path: string, showNotification: boolean = false) {
    const dbRef = ref(this.db);
    try {
      const snapshot = await get(child(dbRef, path));
      if (snapshot.exists()) {
        return snapshot.val();
      } else {

        if (showNotification)
          this.notificationService.showNotification({
            heading: 'Something Went Wrong!',
            message: 'Please Contact IT Support!',
            duration: 5000,
            leftBarColor: '#ff0000'
          });

        return {};
      }
    } catch (error) {
      console.error("Error fetching data:", error);

      this.notificationService.showNotification({
        heading: 'Something Went Wrong!',
        message: 'Please Contact IT Support!',
        duration: 5000,
        leftBarColor: '#ff0000'
      });

      return {};
    }
  }

  setData(path: string, data: any) {
    return set(ref(this.db, path), data);
  }
}
