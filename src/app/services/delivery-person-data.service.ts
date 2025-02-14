import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPersonDataService {

  private deliveryPersonData = new BehaviorSubject<any>(null);
  deliveryPersonData$ = this.deliveryPersonData.asObservable();

  constructor(
    private afAuth: AngularFireAuth
  ) {
    const storedVacancy = sessionStorage.getItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA);
    if (storedVacancy)
      this.deliveryPersonData?.next(JSON.parse(storedVacancy));
  }

  setDeliveryPersonData(data: any) {
    this.deliveryPersonData?.next(data);
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA, JSON.stringify(data));
  }

  getDeliveryPersonData() {
    return this.deliveryPersonData?.value;
  }

  hasDeliveryPersonData() {
    return !!this.deliveryPersonData?.value;
  }
}
