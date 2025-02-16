import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { BehaviorSubject, Subject } from 'rxjs';
import { Customer } from '../../assets/models/Customer';
import { AccountService } from './account.service';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataService {

  private customerData = new BehaviorSubject<any>(null);
  customerData$ = this.customerData.asObservable();

  isDataChanged = new Subject<any>();

  constructor(
    private afAuth: AngularFireAuth,
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService
  ) {
    const storedVacancy = sessionStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA);
    if (storedVacancy)
      this.customerData?.next(JSON.parse(storedVacancy));
  }

  setCustomerData(data: any) {
    this.customerData?.next(data);
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA, JSON.stringify(data));
  }

  addNewCustomer(newUserId: string, fullName: string, phoneNumber: string) {
    const newCustomer: Customer = {
      data: {
        fullName: fullName,
        phoneNumber: phoneNumber,
        address: '',
        shippingAddress: '',
        extraNote: '',
        userId: newUserId
      },
      others: {
        createdBy: this.accountService.getUserId(),
        createdTime: Date.now()
      }
    }

    this.firebaseService.setData(`customer/bucket/${newCustomer.data.userId}`, newCustomer).then((result) => {
      let objects = this.getCustomerList();
      objects[newCustomer.data.userId] = newCustomer;
      this.setCustomerData({
        customerList: objects,
        others: {
          lastFrereshed: Date.now()
        }
      });
      this.isDataChanged.next(true);

      this.notificationService.showNotification({
        heading: `${newCustomer.data.fullName}'s account created.`,
        message: 'Cew customer added successfully.',
        duration: 5000,
        leftBarColor: '#3A7D44'
      });
    }).catch((error) => {
      this.isDataChanged.next(false);
      this.notificationService.somethingWentWrong('110');
    });
  }

  getAddress(userId?: string) {
    if (userId)
      return this.getCustomerList()[userId]?.data?.address || '';
    else
      return '';
  }

  getCustomerData() {
    return this.customerData?.value;
  }

  getCustomerList() {
    return this.customerData?.value?.customerList || {};
  }

  hasCustomerData() {
    return !!this.customerData?.value;
  }
}
