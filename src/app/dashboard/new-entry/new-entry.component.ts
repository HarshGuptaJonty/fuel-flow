import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { CommonModule } from '@angular/common';
import { generateRandomString } from '../../shared/commonFunctions';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-new-entry',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    MatButtonModule,
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './new-entry.component.html',
  styleUrl: './new-entry.component.scss'
})
export class NewEntryComponent implements OnInit {

  @Input() customerObject?: Customer;

  @Output() onCancel = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<EntryTransaction>();

  disableSave: boolean = true;

  entryForm: FormGroup = new FormGroup({
    date: new FormControl(this.getDateInFormat()),
    unitsSent: new FormControl(''),
    unitsRecieved: new FormControl(''),
    rate: new FormControl(''),
    paidAmt: new FormControl(''),
    deliveryBoyName: new FormControl(''),
    deliveryBoyNumber: new FormControl(''),
    deliveryBoyAddress: new FormControl(''),
    extraDetails: new FormControl(''),
  });

  constructor(
    private accountService: AccountService
  ) { }

  ngOnInit(): void {
    this.entryForm.valueChanges.subscribe((value) => {
      this.checkForDataValidation(value);
    });
  }

  onSaveClick() {
    const value = this.entryForm.value;

    const day = value.date.slice(0, 2); // dd
    const month = value.date.slice(2, 4); // MM
    const year = value.date.slice(4); // yyyy

    let data: EntryTransaction = {
      data: {
        date: day + '/' + month + '/' + year,
        customer: {
          fullName: this.customerObject?.data?.fullName,
          phoneNumber: this.customerObject?.data?.phoneNumber,
          userId: this.customerObject?.data?.userId,
        },
        deliveryBoy: {
          fullName: value.deliveryBoyName,
          phoneNumber: value.deliveryBoyNumber,
          userId: value.deliveryBoyAddress, // TODO work on this
        },
        sent: value.unitsSent,
        recieved: value.unitsRecieved,
        rate: value.rate,
        payment: value.paidAmt,
        transactionId: year + month + day + '_' + this.generateDateTimeKey(),
      }, others: {
        createdBy: this.accountService.getUserId(),
        createdTime: Date.now(),
        editedBy: this.accountService.getUserId(),
        editedTime: Date.now(),
      }
    }
    this.onSubmit.emit(data);
  }

  generateDateTimeKey() { // HHmmss
    let today = new Date();
    let sec: any = today.getSeconds();
    let min: any = today.getMinutes();
    let hour: any = today.getHours();

    sec = sec < 10 ? '0' + sec : sec;
    min = min < 10 ? '0' + min : min;
    hour = hour < 10 ? '0' + hour : hour;
    return `${hour}${min}${sec}`;
  }

  getDateInFormat() { // ddMMyyyy
    let today = new Date();
    let day: any = today.getDate();
    let month: any = today.getMonth() + 1;
    let year = today.getFullYear();

    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;
    return `${day}${month}${year}`;
  }

  checkForDataValidation(value: any) {
    this.disableSave = false;

    if (value.date?.length == 0)
      this.disableSave = true;
    else if (value.unitsSent == 0 && value.unitsRecieved == 0 && value.paidAmt == 0)
      this.disableSave = true;
    else if (parseInt(value.unitsRecieved) > (this.customerObject?.entry?.pendingCount || 0))
      this.disableSave = true;
    else if (value.unitsSent > 0 && value.rate == 0)
      this.disableSave = true;
    else if (value.deliveryBoyName.length == 0)
      this.disableSave = true;
    else if (value.deliveryBoyNumber.length > 0 && value.deliveryBoyNumber.length != 10)
      this.disableSave = true;
    else if (value.deliveryBoyNumber.length > 0 && parseInt(String(value.deliveryBoyNumber).charAt(0)) < 6)
      this.disableSave = true;
    else if (value.deliveryBoyAddress.length > 0 && value.deliveryBoyAddress.length < 5)
      this.disableSave = true;
  }

  onCancelClick() {
    this.onCancel.emit();
  }
}