import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CustomerDataService} from '../../services/customer-data.service';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { Customer } from '../../../assets/models/Customer';

@Component({
  selector: 'app-new-customer',
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
  templateUrl: './new-customer.component.html',
  styleUrl: './new-customer.component.scss'
})
export class NewCustomerComponent implements OnInit {

  @Output() onCancel = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<any>();

  userId?: string;
  customerList?: any;
  disableSave: boolean = false;
  phoneNumbers: string[] = [];

  customerForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10),
    Validators.pattern(/^[6-9]\d{9}$/), this.duplicateNumberValidator.bind(this)]),
    address: new FormControl(''),
    extraNote: new FormControl('')
  });

  constructor(
    private afAuth: AngularFireAuth,
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private customerService: CustomerDataService
  ) { }

  ngOnInit(): void {
    this.userId = this.accountService.getUserId();
    if (this.customerService.hasCustomerData()) {
      this.customerList = this.customerService.getCustomerList();
      this.phoneNumbers = Object.values(this.customerList).map((user: any) => user?.data?.phoneNumber);
    } else {
      this.customerList = {};
    }
  }

  getErrorMessage(controlName: string) {
    if (controlName === 'phoneNumber') {
      if (this.customerForm.controls[controlName].hasError('required'))
        return 'Please enter phone number.';
      else if (this.customerForm.controls[controlName].hasError('minlength'))
        return 'Please enter 10 digit phone number.';
      else if (this.customerForm.controls[controlName].hasError('duplicate'))
        return 'Customer with this number already present in your database.';
      else if (this.customerForm.controls[controlName].hasError('pattern'))
        return 'Please enter a valid Indian phone number.';
    }
    return '';
  }

  saveCustomerData() {
    const newCustomer: Customer = {
      data: this.customerForm.value,
      others: {
        createdBy: this.userId,
        createdTime: Date.now()
      }
    }

    this.firebaseService.setData(`customer/bucket/${newCustomer.data?.phoneNumber}`, newCustomer).then((result) => {
      this.onSubmit.emit();
      this.onCancel.emit();
    }).catch((error) => {
      //TODO: left bottom notification
    })
  }

  cancelClicked() {
    this.onCancel.emit();
  }

  duplicateNumberValidator(control: AbstractControl) {
    const numberToSearch = control.value;
    if (this.phoneNumbers?.includes(numberToSearch))
      return { duplicate: true };
    return null;
  }
}
