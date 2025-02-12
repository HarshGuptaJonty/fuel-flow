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

  private async initialize() {
    let data = await this.firebaseService.getData('transactionList');
    if (Object.keys(data).length > 0) {
      this.transactionList.next(data);
      this.isDataChanged.next(true);
    } else {
      this.transactionList.next(null);
      this.isDataChanged.next(false);
    }
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

  addNewEntry(entry: EntryTransaction) {
    this.firebaseService.setData(`transactionList/${entry.data?.transactionId}`, entry)
      .then((result) => {
        let list = this.transactionList.getValue() || [];
        list = [...list, entry];
        this.transactionList.next(list);
        this.isDataChanged.next(true);

        this.notificationService.showNotification({
          heading: 'New enter added.',
          message: 'Data saved successfully.',
          duration: 5000,
          leftBarColor: this.notificationService.color.green
        });
      }).catch((error) => {
        this.isDataChanged.next(false);
        this.notificationService.somethingWentWrong();
        console.log(error);
      });
  }
}

export const transactionMock = [
  {
    data: {
      date: '28/01/2025',
      customer: {
        fullName: 'Harsh Gupta',
        phoneNumber: '6291444925',
        userId: 'bXQ7CXuASpwpwy'
      }, deliveryBoy: {
        fullName: 'Kabir Singh',
        phoneNumber: '7278886803',
        userId: 'XbQC7XAuSowpyw'
      },
      sent: 0,
      recieved: 3,
      rate: 0,
      payment: 2000,
      transactionId: '20250128_000000'
    }
  }, {
    data: {
      date: '24/01/2025',
      customer: {
        fullName: 'Harsh Gupta',
        phoneNumber: '6291444925',
        userId: 'bXQ7CXuASpwpwy'
      }, deliveryBoy: {
        fullName: 'Dubey Sinha',
        phoneNumber: '7278886803',
        userId: 'XbQC7XAuSowpyw'
      },
      sent: 0,
      recieved: 2,
      rate: 0,
      payment: 3000,
      transactionId: '20250124_000000'
    }
  }, {
    data: {
      date: '01/01/2025',
      customer: {
        fullName: 'Harsh Gupta',
        phoneNumber: '6291444925',
        userId: 'bXQ7CXuASpwpwy'
      }, deliveryBoy: {
        fullName: 'Sekhar Gupta',
        phoneNumber: '8017428696',
        userId: 'XbQC7XuASpwpyw'
      },
      sent: 5,
      recieved: 0,
      rate: 1400,
      payment: 2000,
      transactionId: '20250101_000000'
    }
  }
]
