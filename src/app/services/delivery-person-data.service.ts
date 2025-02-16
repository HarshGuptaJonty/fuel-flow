import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Subject } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPersonDataService {

  private deliveryPersonData = new BehaviorSubject<any>(null);
  deliveryPersonData$ = this.deliveryPersonData.asObservable();

  isDataChanged = new Subject<any>();

  constructor(
    private afAuth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private notificationService: NotificationService,
    private accountService: AccountService
  ) {
    const storedVacancy = sessionStorage.getItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA);
    if (storedVacancy)
      this.deliveryPersonData?.next(JSON.parse(storedVacancy));
  }

  setDeliveryPersonData(data: any) {
    this.deliveryPersonData?.next(data);
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA, JSON.stringify(data));
  }

  addNewDeliveryPerson(newUserId: string, fullName: string, phoneNumber: string, address?: string) {
    const newDeliveryPerson = {
      data: {
        fullName: fullName,
        phoneNumber: phoneNumber,
        address: address || '',
        extraNote: '',
        userId: newUserId
      },
      others: {
        createdBy: this.accountService.getUserId(),
        createdTime: Date.now()
      }
    };

    this.firebaseService.setData(`deliveryPerson/bucket/${newDeliveryPerson.data.userId}`, newDeliveryPerson).then((result) => {
      let objects = this.getDeliveryPersonList();
      objects[newDeliveryPerson.data.userId] = newDeliveryPerson;
      this.setDeliveryPersonData({
        deliveryPersonList: objects,
        others: {
          lastFrereshed: Date.now()
        }
      });
      this.isDataChanged.next(true);

      this.notificationService.showNotification({
        heading: `${newDeliveryPerson.data.fullName}'s account created.`,
        message: 'New delivery person added successfully.',
        duration: 5000,
        leftBarColor: '#3A7D44'
      });
    }).catch((error) => {
      this.isDataChanged.next(false);
      this.notificationService.somethingWentWrong('106');
    });
  }

  deleteDeliveryPerson(userId: string) {
    this.firebaseService.setData(`deliveryPerson/bucket/${userId}`, null)
      .then(() => {
        let objects = this.getDeliveryPersonList();
        delete objects[userId];
        this.setDeliveryPersonData({
          deliveryPersonList: objects,
          others: {
            lastFrereshed: Date.now()
          }
        });
        this.isDataChanged.next(true);

        this.notificationService.showNotification({
          heading: 'Delivery person profile deleted successfully.',
          duration: 5000,
          leftBarColor: this.notificationService.color.green
        });
      }).catch((error) => {
        this.notificationService.somethingWentWrong('108');
      });
  }

  getAddress(userId?: string) {
    if (userId)
      return this.getDeliveryPersonList()[userId]?.data?.address || '';
    else
      return '';
  }

  getDeliveryPersonData() {
    return this.deliveryPersonData?.value;
  }

  getDeliveryPersonList() {
    return this.deliveryPersonData?.value?.deliveryPersonList || {};
  }

  hasDeliveryPersonData() {
    return !!this.deliveryPersonData?.value;
  }
}
