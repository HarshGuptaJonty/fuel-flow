import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { BehaviorSubject, Subject } from 'rxjs';
import { Customer } from '../../assets/models/Customer';
import { AccountService } from './account.service';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { EntryDataService } from './entry-data.service';

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
    private notificationService: NotificationService,
    private entryDataService: EntryDataService
  ) {
    const storedVacancy = sessionStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA);
    if (storedVacancy)
      this.customerData?.next(JSON.parse(storedVacancy));
  }

  setCustomerData(data: any) {
    this.customerData?.next(data);
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA, JSON.stringify(data));
  }

  async addNewCustomerFull(newCustomer: Customer): Promise<boolean> {
    return this.firebaseService.setData(`customer/bucket/${newCustomer.data.userId}`, newCustomer).then(() => {
      const objects = this.getCustomerList();
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
        message: 'New customer added successfully.',
        duration: 5000,
        leftBarColor: '#3A7D44'
      });

      return true;
    }).catch(() => {
      this.isDataChanged.next(false);
      this.notificationService.somethingWentWrong('110');

      return false;
    });
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

    this.addNewCustomerFull(newCustomer);
  }

  async refreshData(showNotification = false) {
    const latestData = await this.firebaseService.getData('customer/bucket'); // todo increase database efficiency
    const data = {
      customerList: latestData,
      others: {
        lastFrereshed: Date.now()
      }
    }
    this.setCustomerData(data);

    if (Object.keys(latestData).length === 0)
      this.notificationService.showNotification({
        heading: 'No customer data!',
        message: 'Please add a customer.',
        duration: 5000,
        leftBarColor: this.notificationService.color.red
      });
    else if (showNotification)
      this.notificationService.showNotification({
        heading: 'Customer data refreshed.',
        duration: 5000,
        leftBarColor: this.notificationService.color.green
      });
  }

  deleteCustoner(userId: string) {
    if (this.entryDataService.customerHasData(userId)) {
      this.notificationService.showNotification({
        heading: 'Process denied.',
        message: 'Customer with entries cannot be deleted, please delete the entries first!',
        duration: 7000,
        leftBarColor: this.notificationService.color.yellow
      });
      return;
    }
    this.firebaseService.setData(`customer/bucket/${userId}`, null)
      .then(() => {
        const objects = this.getCustomerList();
        delete objects[userId];
        this.setCustomerData({
          customerList: objects,
          others: {
            lastFrereshed: Date.now()
          }
        });

        this.notificationService.showNotification({
          heading: 'Customer profile deleted successfully.',
          duration: 5000,
          leftBarColor: this.notificationService.color.green
        });
        this.isDataChanged.next(true);
      }).catch(() => {
        this.notificationService.somethingWentWrong('107');
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
