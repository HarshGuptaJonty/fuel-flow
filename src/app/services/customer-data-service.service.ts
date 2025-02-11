import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerDataServiceService {

  private customerData = new BehaviorSubject<any>(null);
  customerData$ = this.customerData.asObservable();

  constructor(
    private afAuth: AngularFireAuth
  ) {
    const storedVacancy = sessionStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA);
    if (storedVacancy)
      this.customerData?.next(JSON.parse(storedVacancy));
  }

  setCustomerData(data: any) {
    this.customerData?.next(data);
    sessionStorage.setItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA, JSON.stringify(data));
  }

  getCustomerData() {
    return this.customerData?.value;
  }

  getCustomerList() {
    return this.customerData?.value?.customerList;
  }

  hasCustomerData() {
    return !!this.customerData?.value;
  }
}
