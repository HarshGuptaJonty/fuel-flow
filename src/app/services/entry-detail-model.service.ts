import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EntryTransaction, UserData } from '../../assets/models/EntryTransaction';
import { AdminDataService } from './admin-data.service';
import { formatDateAndTime } from '../shared/commonFunctions';

@Injectable({
  providedIn: 'root'
})
export class EntryDetailModelService {

  private entryData = new BehaviorSubject<any>(null);
  entryData$ = this.entryData.asObservable();

  deliveryBoyData?: UserData;

  constructor(
    private adminDataService: AdminDataService
  ) { }

  showModel(data: EntryTransaction) {
    this.deliveryBoyData = data.data.deliveryBoy;
    this.entryData.next(this.formatData(data));
  }

  getDeliveryBoyData() {
    return this.deliveryBoyData;
  }

  hideModel() {
    this.entryData.next(null);
  }

  formatData(entry: EntryTransaction) {
    return {
      transactionId: entry.data.transactionId,
      shippingAddress: entry.data.shippingAddress,
      cName: entry.data.customer?.fullName,
      cNumber: entry.data.customer?.phoneNumber?.toString().replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'),
      date: this.formatDate(entry.data.date),
      sent: entry.data.sent,
      recieved: entry.data.recieved,
      rate: entry.data.rate,
      totalAmt: (entry.data?.rate || 0) * (entry.data?.sent || 0),
      paymentAmt: entry.data.payment,
      paymentDueAmt: (entry.data?.rate || 0) * (entry.data?.sent || 0) - (entry.data.payment || 0),
      dName: entry.data.deliveryBoy?.fullName,
      dNumber: entry.data.deliveryBoy?.phoneNumber?.toString().replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3'),
      dId: entry.data.deliveryBoy?.userId,
      extraDetails: entry.data.extraDetails,
      createdBy: this.adminDataService.getAdminName(entry.others?.createdBy),
      createdTime: formatDateAndTime(entry.others?.createdTime),
      editedBy: this.adminDataService.getAdminName(entry.others?.editedBy),
      editedTime: formatDateAndTime(entry.others?.editedTime)
    }
  }

  formatDate(dateStr?: string) {
    if (!dateStr)
      return null;

    const [day, month, year] = dateStr.split('/');
    const date = new Date(`${year}-${month}-${day}`);

    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
