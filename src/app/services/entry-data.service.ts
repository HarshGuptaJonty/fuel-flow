import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { EntryTransaction } from '../../assets/models/EntryTransaction';
import { NotificationService } from './notification.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class EntryDataService {

  private transactionList = new BehaviorSubject<any>(null); // this loads all the transaction of the current year and store in it for usage
  transactionList$ = this.transactionList.asObservable();

  isDataChanged = new Subject<any>();

  constructor(
    private afAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {
    this.initialize();
  }

  private async initialize(showNotification: boolean = false) {
    let data = await this.firebaseService.getData('transactionList');
    if (Object.keys(data).length > 0) {
      this.transactionList.next(data);
      this.isDataChanged.next(true);

      if (showNotification)
        this.notificationService.transactionListRefreshed();
    } else {
      this.transactionList.next(null);
      this.isDataChanged.next(false);

      if (showNotification) {
        this.notificationService.showNotification({
          heading: 'No transaction to show!',
          duration: 5000,
          leftBarColor: this.notificationService.color.red
        });
      }
    }
  }

  hardRefresh() {
    this.initialize(true);
  }

  getTransactionList() {
    return this.transactionList.value;
  }

  getCustomerTransactionList(customerId?: string): EntryTransaction[] {
    if (this.isDataChanged && this.getTransactionList()) {
      return (Object.values(this.getTransactionList()) as EntryTransaction[])
        .filter((obj: any) => obj?.data?.customer?.userId === customerId)
        .sort((a, b) => a.data?.transactionId > b.data?.transactionId ? 1 : -1);
    }
    return [];
  }

  addNewEntry(entry: EntryTransaction, isEditing: boolean = false) {
    this.firebaseService.setData(`transactionList/${entry.data?.transactionId}`, entry)
      .then((result) => {
        let objects = this.transactionList.getValue() || {};
        objects[entry.data.transactionId] = entry;
        this.transactionList.next(objects);
        this.isDataChanged.next(true);

        this.notificationService.showNotification({
          heading: isEditing ? 'Entry edited.' : 'New entry added.',
          message: 'Data saved successfully.',
          duration: 5000,
          leftBarColor: this.notificationService.color.green
        });
      }).catch((error) => {
        this.isDataChanged.next(false);
        this.notificationService.somethingWentWrong('102');
      });
  }

  deleteEntry(entry: EntryTransaction) {
    this.firebaseService.setData(`transactionList/${entry.data?.transactionId}`, null)
      .then((result) => {
        let objects = this.transactionList.getValue() || {};
        delete objects[entry.data.transactionId];
        this.transactionList.next(objects);
        this.isDataChanged.next(true);

        this.notificationService.showNotification({
          heading: 'Entry deleted!',
          message: 'Data erased successfully.',
          duration: 5000,
          leftBarColor: this.notificationService.color.green
        });
      }).catch((error) => {
        this.notificationService.somethingWentWrong('103');
        this.isDataChanged.next(false);
      });
  }
}