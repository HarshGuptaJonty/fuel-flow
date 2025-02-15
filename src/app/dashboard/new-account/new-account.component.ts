import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CustomerDataService } from '../../services/customer-data.service';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { Customer } from '../../../assets/models/Customer';
import { NotificationService } from '../../services/notification.service';
import { generateRandomString } from '../../shared/commonFunctions';
import { DeliveryPerson } from '../../../assets/models/DeliveryPerson';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';

@Component({
  selector: 'app-new-account',
  imports: [
    CommonModule,
    NgxMaskDirective,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    provideNgxMask(),
    AngularFireAuth
  ],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.scss'
})
export class NewAccountComponent implements OnInit {

  @Output() onCancel = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<any>();

  @Input() editProfileId: string = '';
  @Input() userType: string = '';
  @Input() isEditingProfile: boolean = false;

  userId?: string;
  accountId?: string;
  accountList?: any;
  disableSave: boolean = false;
  phoneNumbers: string[] = [];
  userLabel: string = '';

  accountForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10),
    Validators.pattern(/^[6-9]\d{9}$/), this.duplicateNumberValidator.bind(this)]),
    address: new FormControl(''),
    shippingAddress: new FormControl(''),
    extraNote: new FormControl(''),
    userId: new FormControl('')
  });

  constructor(
    private afAuth: AngularFireAuth,
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private customerService: CustomerDataService,
    private notificationService: NotificationService,
    private deliveryPersonDataService: DeliveryPersonDataService
  ) { }

  ngOnInit(): void {
    this.userLabel = this.userType === 'customer' ? 'Customer' : 'Delivery Person';

    this.accountList = {};
    this.userId = this.accountService.getUserId();

    if (this.userType === 'customer' && this.customerService.hasCustomerData()) {
      this.accountList = this.customerService.getCustomerList();
      this.phoneNumbers = Object.values(this.accountList).map((user: any) => user?.data?.phoneNumber);
    } else if (this.userType === 'deliveryPerson' && this.deliveryPersonDataService.hasDeliveryPersonData()) {
      this.accountList = this.deliveryPersonDataService.getDeliveryPersonList();
      this.phoneNumbers = Object.values(this.accountList).map((user: any) => user?.data?.phoneNumber);
    }

    this.setupForm();

    if (this.isEditingProfile)
      this.accountId = this.editProfileId;
    else
      this.accountId = generateRandomString();
  }

  setupForm() {
    const accountData = this.accountList?.[this.editProfileId];

    if (accountData && this.isEditingProfile) {
      const data = accountData.data;
      this.accountForm = new FormGroup({
        fullName: new FormControl(data.fullName, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
        phoneNumber: new FormControl(data.phoneNumber, [Validators.required, Validators.minLength(10), Validators.maxLength(10),
        Validators.pattern(/^[6-9]\d{9}$/), this.duplicateNumberValidator.bind(this)]),
        address: new FormControl(data.address),
        shippingAddress: new FormControl(data.shippingAddress),
        extraNote: new FormControl(data.extraNote),
        userId: new FormControl(data.userId)
      });
    } else
      this.isEditingProfile = false;
  }

  getErrorMessage(controlName: string) {
    if (controlName === 'phoneNumber') {
      if (this.accountForm?.controls[controlName].hasError('required'))
        return 'Please enter phone number.';
      else if (this.accountForm?.controls[controlName].hasError('minlength'))
        return 'Please enter 10 digit phone number.';
      else if (this.accountForm?.controls[controlName].hasError('duplicate'))
        return 'Account with this number already present.';
      else if (this.accountForm?.controls[controlName].hasError('pattern'))
        return 'Please enter a valid Indian phone number.';
    }
    return '';
  }

  saveAccountData() {
    if (!this.isEditingProfile)
      this.accountForm.get('userId')?.setValue(this.accountId);

    const newAccount: any = {
      data: this.accountForm?.value,
      others: {
        createdBy: this.userId,
        createdTime: Date.now()
      }
    }

    if (this.userType !== 'customer')
      newAccount.data.shippingAddress = null;

    this.firebaseService.setData(`${this.userType}/bucket/${newAccount.data?.userId}`, newAccount).then((result) => {
      this.onSubmit.emit();
      this.onCancel.emit();

      this.notificationService.showNotification({
        heading: this.isEditingProfile ? this.userLabel + ' profile updated.' : `New ${this.userLabel} added.`,
        message: this.userLabel + ' details saved successfully.',
        duration: 5000,
        leftBarColor: '#3A7D44'
      });
    }).catch((error) => this.notificationService.somethingWentWrong('105'));
  }

  cancelClicked() {
    this.onCancel.emit();
  }

  duplicateNumberValidator(control: AbstractControl) {
    const numberToSearch = control.value;
    if (!this.isEditingProfile && this.phoneNumbers?.includes(numberToSearch))
      return { duplicate: true };
    return null;
  }
}
