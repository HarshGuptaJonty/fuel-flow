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
import { generateRandomString } from '../../shared/commonFunctions';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { DeliveryPerson } from '../../../assets/models/DeliveryPerson';

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
    deliveryBoyUserId: new FormControl(generateRandomString()), // not user input
  });

  disableSave: boolean = true;
  isEditing: boolean = false;
  errorMessage?: string;
  phoneNumbers: string[] = [];
  deliveryBoysList: DeliveryPerson[] = [];
  deliveryBoysSearchList: DeliveryPerson[] = [];
  deliveryBoySelected: boolean = false;
  focusedFormName: string = '';

  constructor(
    private accountService: AccountService,
    private entryDataService: EntryDataService,
    private confirmationModelService: ConfirmationModelService,
    private deliveryPersonDataService: DeliveryPersonDataService
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
        deliveryBoyAddress: new FormControl(this.deliveryPersonDataService.getAddress(this.openTransaction?.data.deliveryBoy?.userId || '')),
        extraDetails: new FormControl(this.openTransaction?.data.extraDetails),
        deliveryBoyUserId: new FormControl(this.openTransaction?.data.deliveryBoy?.userId),
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
        extraDetails: new FormControl(''),
        deliveryBoyUserId: new FormControl(generateRandomString()),
      });
    }

    if (this.deliveryPersonDataService.hasDeliveryPersonData()) {
      this.deliveryBoysList = Object.values(this.deliveryPersonDataService.getDeliveryPersonList());
      this.phoneNumbers = this.deliveryBoysList.map((user: any) => user?.data?.phoneNumber);
      this.deliveryBoysSearchList = this.deliveryBoysList;
    }

    // this.deliveryPersonDataService.isDataChanged.subscribe((result) => {
    //   if (result === true) {
    //     this.deliveryBoysList = Object.values(this.deliveryPersonDataService.getDeliveryPersonList());
    //     this.phoneNumbers = this.deliveryBoysList.map((user: any) => user?.data?.phoneNumber);
    //     console.log('yes has delivery person auto updated', this.deliveryBoysList);
    //   } else
    //   console.log('no has no delivery person auto update', this.deliveryBoysList);
    // });

    this.entryForm.valueChanges.subscribe((value) => this.checkForDataValidation(value));

    this.entryForm.get('deliveryBoyName')?.valueChanges.subscribe((value) => {
      if (this.deliveryBoySelected) {
        this.deliveryBoySelected = false;
        this.entryForm.get('deliveryBoyUserId')?.setValue(generateRandomString());
      }

      if (value.length == 0)
        this.deliveryBoysSearchList = this.deliveryBoysList;
      else
        this.deliveryBoysSearchList = this.deliveryBoysList.filter((item) =>
          Object.values(item.data || {}).toString().toLowerCase().includes(value.toLowerCase())
        );
    });
    this.entryForm.get('deliveryBoyNumber')?.valueChanges.subscribe((value) => {
      if (this.deliveryBoySelected) {
        this.deliveryBoySelected = false;
        this.entryForm.get('deliveryBoyUserId')?.setValue(generateRandomString());
      }

      if (value.length == 0)
        this.deliveryBoysSearchList = this.deliveryBoysList;
      else
        this.deliveryBoysSearchList = this.deliveryBoysList.filter((item) =>
          Object.values(item.data || {}).toString().toLowerCase().includes(value.toLowerCase())
        );
    });
  }

  onSelectDeliveryBoy(deliveryBoy: DeliveryPerson) {
    this.entryForm.get('deliveryBoyName')?.setValue(deliveryBoy.data?.fullName);
    this.entryForm.get('deliveryBoyNumber')?.setValue(deliveryBoy.data?.phoneNumber);
    this.entryForm.get('deliveryBoyAddress')?.setValue(deliveryBoy.data?.address);
    this.deliveryBoySelected = true;
    this.entryForm.get('deliveryBoyUserId')?.setValue(deliveryBoy.data?.userId);
    this.deliveryBoysSearchList = [];
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
    let transactionId = this.openTransaction?.data.transactionId ||
      this.getFormattedDate('YYYYMMDD') + '_' + this.generateDateTimeKey() + '_' + generateRandomString(5);

    const deliveryPerson: any = {
      fullName: value.deliveryBoyName,
      phoneNumber: value.deliveryBoyNumber,
      userId: value.deliveryBoyUserId,
    }
    
    if (!this.deliveryBoySelected)
      this.deliveryPersonDataService.addNewDeliveryPerson(deliveryPerson.userId, deliveryPerson.fullName, deliveryPerson.phoneNumber, value.deliveryBoyAddress);

    let data: EntryTransaction = {
      data: {
        date: this.getFormattedDate('DD/MM/YYYY'),
        customer: {
          fullName: this.customerObject?.data?.fullName,
          phoneNumber: this.customerObject?.data?.phoneNumber,
          userId: this.customerObject?.data?.userId || generateRandomString(),
        },
        deliveryBoy: deliveryPerson,
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
    this.errorMessage = undefined;

    if (this.getFormattedDate('DD/MM/YYYY').length == 0) {
      this.disableSave = true;
      this.errorMessage = 'Please enter date of entry.';
    } else if (value.unitsSent == 0 && value.unitsRecieved == 0 && value.paidAmt == 0) {
      this.disableSave = true;
      this.errorMessage = 'Any of Sent, Recieved and Payment is required.';
    } else if (parseInt(value.unitsRecieved) > ((this.pendingCount || 0) + (value.unitsSent || 0))) {
      this.disableSave = true;
      this.errorMessage = `Units recieved(${value.unitsRecieved}) cannot be more than pending(${this.pendingCount || 0}) units.`;
    } else if (value.unitsSent > 0 && value.rate == 0) {
      this.disableSave = true;
      this.errorMessage = 'Rate is required if units are sent.';
    } else if (value.deliveryBoyName?.length == 0) {
      this.disableSave = true;
      this.errorMessage = "Please enter delivery boy's name.";
    } else if (value.deliveryBoyNumber?.length > 0 && value.deliveryBoyNumber?.length != 10) {
      this.disableSave = true;
      this.errorMessage = 'Delivery boy number is not 10 digits.';
    } else if (value.deliveryBoyNumber?.length > 0 && parseInt(String(value.deliveryBoyNumber).charAt(0)) < 6) {
      this.disableSave = true;
      this.errorMessage = 'Invalid delivery boy number.';
    } else if (value.deliveryBoyAddress?.length > 0 && value.deliveryBoyAddress?.length < 5) {
      this.disableSave = true;
      this.errorMessage = 'Please enter atlest 5 character for address.';
    } else if (!this.deliveryBoySelected) {
      const numberToSearch: string = this.entryForm.get('deliveryBoyNumber')?.value;
      if (numberToSearch?.length === 10 && this.phoneNumbers.includes(numberToSearch)) {
        this.disableSave = true;
        this.errorMessage = "Delivery person with same number already present. please select from dropdown list.";
      }
    }
  }

  generateDateTimeKey() { // HHmmss
    let today = new Date();
    let hour: any = today.getHours();
    let min: any = today.getMinutes();
    let sec: any = today.getSeconds();

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

  formatNumber(value?: string) {
    if (!value)
      return '';
    return value.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  onfocus(formName: string) {
    this.focusedFormName = formName;
  }
}