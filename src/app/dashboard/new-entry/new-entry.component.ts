import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../services/account.service';
import { EntryDataService } from '../../services/entry-data.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import moment from 'moment';

@Component({
  selector: 'app-new-entry',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective,
    MatButtonModule,
    MatNativeDateModule,
    MatDatepickerModule
  ],
  providers: [
    provideNgxMask()
  ],
  templateUrl: './new-entry.component.html',
  styleUrl: './new-entry.component.scss'
})
export class NewEntryComponent implements OnInit {

  @Input() customerObject?: Customer;
  @Input() pendingCount: number = 0;
  @Input() openTransaction?: EntryTransaction;

  @Output() onCancel = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<EntryTransaction>();

  disableSave: boolean = true;
  isEditing: boolean = false;

  entryForm: FormGroup = new FormGroup({
    date: new FormControl(this.getDateInFormat()),
    unitsSent: new FormControl(''),
    unitsRecieved: new FormControl(''),
    rate: new FormControl(''),
    paidAmt: new FormControl(''),
    deliveryBoyName: new FormControl(''),
    deliveryBoyNumber: new FormControl(''),
    deliveryBoyAddress: new FormControl(''),
    extraDetails: new FormControl('')
  });

  constructor(
    private accountService: AccountService,
    private entryDataService: EntryDataService,
    private confirmationModelService: ConfirmationModelService
  ) { }

  ngOnInit(): void {
    this.isEditing = !!this.openTransaction;
    if (this.isEditing) {
      this.entryForm = new FormGroup({
        date: new FormControl({ value: moment(this.openTransaction?.data.date || '', 'DD/MM/YYYY').toDate(), disabled: true }),
        unitsSent: new FormControl(this.openTransaction?.data.sent),
        unitsRecieved: new FormControl(this.openTransaction?.data.recieved),
        rate: new FormControl(this.openTransaction?.data.rate),
        paidAmt: new FormControl(this.openTransaction?.data.payment),
        deliveryBoyName: new FormControl(this.openTransaction?.data.deliveryBoy?.fullName),
        deliveryBoyNumber: new FormControl(this.openTransaction?.data.deliveryBoy?.phoneNumber),
        deliveryBoyAddress: new FormControl(this.openTransaction?.data.deliveryBoy?.userId), // fetch address deom delivery boy service by passing userid
        extraDetails: new FormControl(this.openTransaction?.data.extraDetails)
      });
      this.pendingCount += this.openTransaction?.data.recieved || 0;
    } else {
      this.entryForm = new FormGroup({
        date: new FormControl(this.getDateInFormat()),
        unitsSent: new FormControl(''),
        unitsRecieved: new FormControl(''),
        rate: new FormControl(''),
        paidAmt: new FormControl(''),
        deliveryBoyName: new FormControl(''),
        deliveryBoyNumber: new FormControl(''),
        deliveryBoyAddress: new FormControl(''),
        extraDetails: new FormControl('')
      });
    }

    this.entryForm.valueChanges.subscribe((value) => {
      this.checkForDataValidation(value);
    });
  }

  onSaveClick() {
    const value = this.entryForm.value;

    this.disableSave = true; // to prevent multiple save of same entry
    this.entryDataService.isDataChanged.subscribe((result) => {
      if (result === false) // if save entry failed then enable save for retry but by checking the values
        this.checkForDataValidation(value);
    });

    let createdBy = this.openTransaction?.others?.createdBy || this.accountService.getUserId();
    let createdTime = this.openTransaction?.others?.createdTime || Date.now();
    let transactionId = this.openTransaction?.data.transactionId || this.getFormattedDate('YYYYMMDD') + '_' + this.generateDateTimeKey();

    let data: EntryTransaction = {
      data: {
        date: this.getFormattedDate('DD/MM/YYYY'),
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
        transactionId: transactionId,
        extraDetails: value.extraDetails
      }, others: {
        createdBy: createdBy,
        createdTime: createdTime,
        editedBy: this.accountService.getUserId(),
        editedTime: Date.now(),
      }
    }
    this.onSubmit.emit(data);
  }

  onDeleteClick() {
    this.confirmationModelService.showModel({
      heading: 'Delete entry?',
      message: 'You are trying to delete a entry, once done, cannot be retrived, are you sure?',
      leftButton: {
        text: 'Confirm',
        customClass: this.confirmationModelService.CUSTOM_CLASS.GREY_RED,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS.GREY,
      }
    }).subscribe(result => {
      if (result === 'left') {
        this.confirmationModelService.hideModel();
        this.onDelete.emit();
      } else
        this.confirmationModelService.hideModel();
    });
  }

  onCancelClick() {
    this.onCancel.emit();
  }

  checkForDataValidation(value: any) {
    this.disableSave = false;

    if (value.date?.length == 0) {
      this.disableSave = true;
      console.log('stopped by 1: Date empty'); // TODO remove these consoles
    }
    else if (value.unitsSent == 0 && value.unitsRecieved == 0 && value.paidAmt == 0) {
      this.disableSave = true;
      console.log('stopped by 2: each of three fields are empty');
    }
    else if (parseInt(value.unitsRecieved) > (this.pendingCount || 0)) {
      this.disableSave = true;
      console.log('stopped by 3: units recieved more than pending');
    }
    else if (value.unitsSent > 0 && value.rate == 0) {
      this.disableSave = true;
      console.log('stopped by 4: units sent but rate is 0');
    }
    else if (value.deliveryBoyName.length == 0) {
      this.disableSave = true;
      console.log('stopped by 5: delivery biy name is empty');
    }
    else if (value.deliveryBoyNumber.length > 0 && value.deliveryBoyNumber.length != 10) {
      this.disableSave = true;
      console.log('stopped by 6: invalid delivery boy number');
    }
    else if (value.deliveryBoyNumber.length > 0 && parseInt(String(value.deliveryBoyNumber).charAt(0)) < 6) {
      this.disableSave = true;
      console.log('stopped by 7: invalid indian number');
    }
    else if (value.deliveryBoyAddress.length > 0 && value.deliveryBoyAddress.length < 5) {
      this.disableSave = true;
      console.log('stopped by 8: invalid addres length');
    }
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

  getFormattedDate(format: string): string {
    const date = this.entryForm.get('date')?.value;
    return date ? moment(date).format(format) : '';
  }
}