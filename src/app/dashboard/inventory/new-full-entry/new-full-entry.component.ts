import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { EntryTransaction } from '../../../../assets/models/EntryTransaction';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { generateDateTimeKey, generateRandomString, getDateInDatepickerFormat } from '../../../shared/commonFunctions';
import { Customer } from '../../../../assets/models/Customer';
import { DeliveryPerson } from '../../../../assets/models/DeliveryPerson';
import { AccountService } from '../../../services/account.service';
import { ConfirmationModelService } from '../../../services/confirmation-model.service';
import { DeliveryPersonDataService } from '../../../services/delivery-person-data.service';
import { EntryDataService } from '../../../services/entry-data.service';
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { CustomerDataService } from '../../../services/customer-data.service';
import { Product, ProductQuantity } from '../../../../assets/models/Product';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-full-entry',
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
  templateUrl: './new-full-entry.component.html',
  styleUrl: './new-full-entry.component.scss'
})
export class NewFullEntryComponent implements OnInit {

  @Input() openTransaction?: EntryTransaction;
  @Input() customerObject?: Customer;

  @Output() onCancel = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onSubmit = new EventEmitter<EntryTransaction>();

  @ViewChild('formSection') formSection!: ElementRef;

  entryForm: FormGroup = new FormGroup({
    date: new FormControl(''),
    paidAmt: new FormControl(''),

    customerName: new FormControl(''),
    customerNumber: new FormControl(''),
    customerId: new FormControl(generateRandomString()), // not user input
    shippingAddress: new FormControl(''),

    deliveryBoyName: new FormControl(''),
    deliveryBoyNumber: new FormControl(''),
    deliveryBoyUserId: new FormControl(generateRandomString()), // not user input

    extraDetails: new FormControl(''),
  });

  disableSave = true;
  isEditing = false;
  isRefreshedForProduct = false;
  allowAddProduct = false;
  errorMessage?: string;
  focusedFormName = '';
  transactionId = '';
  totalSum = 0;

  customerPhoneNumbers: string[] = [];
  customerList: Customer[] = [];
  customerSearchList: Customer[] = [];
  customerSelected = false;

  shippingAddressList: string[] = [];
  shippingAddressSearchList: string[] = [];
  shippingAddressSelected = false;

  deliveryPhoneNumbers: string[] = [];
  deliveryBoysList: DeliveryPerson[] = [];
  deliveryBoysSearchList: DeliveryPerson[] = [];
  deliveryBoySelected = false;

  productList: Product[] = [];
  selectedProductList: ProductQuantity[] = [];

  constructor(
    private accountService: AccountService,
    private entryDataService: EntryDataService,
    private confirmationModelService: ConfirmationModelService,
    private deliveryPersonDataService: DeliveryPersonDataService,
    private customerDataService: CustomerDataService,
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isEditing = !!this.openTransaction;
    this.transactionId = this.openTransaction?.data.transactionId || '';

    this.productService.isDataChanged?.subscribe(flag => {
      if (flag)
        this.productList = Object.values(this.productService.getProductList() || {});
    })
    this.productList = Object.values(this.productService.getProductList() || {});

    if (this.isEditing) {
      this.entryForm = new FormGroup({
        date: new FormControl({ value: moment(this.openTransaction?.data.date || '', 'DD/MM/YYYY').toDate(), disabled: true }),
        paidAmt: new FormControl(this.openTransaction?.data.payment || ''),

        customerName: new FormControl(this.openTransaction?.data.customer?.fullName || ''),
        customerNumber: new FormControl(this.openTransaction?.data.customer?.phoneNumber || ''),
        customerId: new FormControl(this.openTransaction?.data.customer?.userId || ''),
        shippingAddress: new FormControl(this.openTransaction?.data.shippingAddress || ''),

        deliveryBoyName: new FormControl(this.openTransaction?.data.deliveryBoy?.fullName || ''),
        deliveryBoyNumber: new FormControl(this.openTransaction?.data.deliveryBoy?.phoneNumber || ''),
        deliveryBoyUserId: new FormControl(this.openTransaction?.data.deliveryBoy?.userId || ''),

        extraDetails: new FormControl(this.openTransaction?.data.extraDetails || ''),
      });

      this.selectedProductList = this.openTransaction?.data.selectedProducts || [];
      this.totalSum = this.openTransaction?.data.total || 0;
      this.customerSelected = true;
      this.shippingAddressSelected = true;
      this.deliveryBoySelected = true;
    } else {
      this.entryForm = new FormGroup({
        date: new FormControl({ value: moment(getDateInDatepickerFormat() || '', 'DDMMYYYY').toDate(), disabled: false }),
        paidAmt: new FormControl(''),

        customerName: new FormControl(''),
        customerNumber: new FormControl(''),
        customerId: new FormControl(generateRandomString()), // not user input
        shippingAddress: new FormControl(''),

        deliveryBoyName: new FormControl(''),
        deliveryBoyNumber: new FormControl(''),
        deliveryBoyUserId: new FormControl(generateRandomString()), // not user input

        extraDetails: new FormControl(''),
      });
    }

    this.loadCustomerData();
    this.loadDeliveryPersonData();

    this.entryForm.valueChanges.subscribe((value) => this.checkForDataValidation(value));

    this.entryForm.get('customerName')?.valueChanges.subscribe((value) => this.customerDataChanged(value));
    this.entryForm.get('customerNumber')?.valueChanges.subscribe((value) => this.customerDataChanged(value));

    this.entryForm.get('shippingAddress')?.valueChanges.subscribe((value) => this.shippingAddressDataChanged(value));

    this.entryForm.get('deliveryBoyName')?.valueChanges.subscribe((value) => this.deliveryBoyDataChanged(value));
    this.entryForm.get('deliveryBoyNumber')?.valueChanges.subscribe((value) => this.deliveryBoyDataChanged(value));

    if (this.customerObject)
      this.onSelectCustomer(this.customerObject);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.formSection && !this.formSection.nativeElement.contains(event.target))
      this.focusedFormName = '';
  }

  loadCustomerData(showNotification = false) {
    if (this.customerDataService.getCustomerData()) {
      this.customerList = Object.values(this.customerDataService.getCustomerList());
      this.customerPhoneNumbers = this.customerList.map((user: any) => user?.data?.phoneNumber);
      this.customerSearchList = this.customerList;

      if (this.isEditing && this.openTransaction?.data.customer?.userId) {
        const customerObject = this.customerDataService.getCustomerList()[this.openTransaction.data.customer.userId];
        this.shippingAddressList = customerObject?.data?.shippingAddress || [];
        this.shippingAddressSearchList = this.shippingAddressList;
      }
    } else if (showNotification) {
      this.notificationService.showNotification({
        heading: 'No Customer data found!',
        duration: 5000,
        leftBarColor: this.notificationService.color.yellow
      });
    }
  }

  loadDeliveryPersonData(showNotification = false) {
    if (this.deliveryPersonDataService.hasDeliveryPersonData()) {
      this.deliveryBoysList = Object.values(this.deliveryPersonDataService.getDeliveryPersonList());
      this.deliveryPhoneNumbers = this.deliveryBoysList.map((user: any) => user?.data?.phoneNumber);
      this.deliveryBoysSearchList = this.deliveryBoysList;
    } else if (showNotification) {
      this.notificationService.showNotification({
        heading: 'No Delivery person data found!',
        duration: 5000,
        leftBarColor: this.notificationService.color.yellow
      });
    }
  }

  onRefreshData() {
    this.notificationService.showNotification({
      heading: 'Data Refreshing...',
      message: 'Downloading new data!',
      duration: 1000,
      leftBarColor: this.notificationService.color.green
    });
    this.productList = Object.values(this.productService.getProductList() || {});
    this.loadCustomerData(true);
    this.loadDeliveryPersonData(true);
  }

  onSelectCustomer(customer: Customer) {
    this.entryForm.get('customerName')?.setValue(customer.data?.fullName);
    this.entryForm.get('customerNumber')?.setValue(customer.data?.phoneNumber);
    this.customerSelected = true;
    this.entryForm.get('customerId')?.setValue(customer.data?.userId);
    this.customerSearchList = [];

    this.shippingAddressList = customer.data?.shippingAddress || [];
    this.shippingAddressSearchList = this.shippingAddressList;
    this.shippingAddressSelected = false;
    this.entryForm.get('shippingAddress')?.setValue('');

    if (this.shippingAddressList.length === 1)
      this.onSelectShippingAddress(this.shippingAddressList[0]);
  }

  onSelectShippingAddress(selectedAddress: string) {
    this.entryForm.get('shippingAddress')?.setValue(selectedAddress);
    this.shippingAddressSelected = true;
    this.shippingAddressSearchList = [];
  }

  onSelectDeliveryBoy(deliveryBoy: DeliveryPerson) {
    this.entryForm.get('deliveryBoyName')?.setValue(deliveryBoy.data?.fullName);
    this.entryForm.get('deliveryBoyNumber')?.setValue(deliveryBoy.data?.phoneNumber);
    this.deliveryBoySelected = true;
    this.entryForm.get('deliveryBoyUserId')?.setValue(deliveryBoy.data?.userId);
    this.deliveryBoysSearchList = [];
  }

  onSaveClick() {
    const value = this.entryForm.value;

    this.disableSave = true; // to prevent multiple save of same entry
    this.entryDataService.isDataChanged.subscribe((result) => {
      if (result === false) // if save entry failed due to backend error then enable save for retry but by checking the values
        this.checkForDataValidation(value);
    });

    const createdBy = this.openTransaction?.others?.createdBy || this.accountService.getUserId();
    const createdTime = this.openTransaction?.others?.createdTime || Date.now();
    const transactionId = this.openTransaction?.data.transactionId ||
      this.getFormattedDate('YYYYMMDD') + '_' + generateDateTimeKey() + '_' + generateRandomString(5);

    const customer: any = {
      fullName: value.customerName,
      phoneNumber: value.customerNumber,
      userId: value.customerId,
    };

    const deliveryPerson: any = {
      fullName: value.deliveryBoyName,
      phoneNumber: value.deliveryBoyNumber,
      userId: value.deliveryBoyUserId,
    };

    if (!this.customerSelected)
      this.customerDataService.addNewCustomer(customer.userId, customer.fullName, customer.phoneNumber);

    if (!this.shippingAddressSelected) {
      this.confirmationModelService.showModel({
        heading: 'Add New Shipping Address?',
        message: `Dear user, ${this.entryForm.get('shippingAddress')?.value} is not present in ${customer.fullName}'s profile. Do you want to add this in the profile?`,
        leftButton: {
          text: 'Confirm',
          customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY_BLUE,
        }, rightButton: {
          text: 'Cancel',
          customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY,
        }
      }).subscribe(result => {
        this.confirmationModelService.hideModel();
        if (result === 'left' && this.entryForm.get('shippingAddress')?.value && customer.userId)
          this.customerDataService.addNewAddress(this.entryForm.get('shippingAddress')?.value, customer.userId);
      });
    }

    if (!this.deliveryBoySelected)
      this.deliveryPersonDataService.addNewDeliveryPerson(deliveryPerson.userId, deliveryPerson.fullName, deliveryPerson.phoneNumber);

    const data: EntryTransaction = {
      data: {
        date: this.getFormattedDate('DD/MM/YYYY'),
        customer: customer,
        deliveryBoy: deliveryPerson,
        total: this.totalSum,
        payment: value.paidAmt,
        transactionId: transactionId,
        extraDetails: value.extraDetails,
        shippingAddress: value.shippingAddress,
        selectedProducts: this.selectedProductList
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
      message: 'You are trying to delete an entry, once done, cannot be retrived, are you sure?',
      leftButton: {
        text: 'Confirm',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY_RED,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY,
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

    if (value.customerName?.length == 0) {
      this.disableSave = true;
      this.errorMessage = "Please enter customer name.";
    } else if (value.customerNumber?.length != 10) {
      this.disableSave = true;
      this.errorMessage = "Please enter customer's number.";
    } else if (value.customerNumber?.length === 10 && parseInt(String(value.customerNumber).charAt(0)) < 6) {
      this.disableSave = true;
      this.errorMessage = 'Invalid customer number.';
    } else if (value.shippingAddress?.length == 0) {
      this.disableSave = true;
      this.errorMessage = "Please enter shipping address.";
    } else if (this.selectedProductList.length === 0 && value.paidAmt == 0) {
      this.disableSave = true;
      this.errorMessage = 'Atleat one product or a payment is required.';
    } else if (value.deliveryBoyName?.length == 0) {
      this.disableSave = true;
      this.errorMessage = "Please enter delivery boy's name.";
    } else if (value.deliveryBoyNumber?.length > 0 && value.deliveryBoyNumber?.length != 10) {
      this.disableSave = true;
      this.errorMessage = 'Delivery boy number is not 10 digits.';
    } else if (value.deliveryBoyNumber?.length > 0 && parseInt(String(value.deliveryBoyNumber).charAt(0)) < 6) {
      this.disableSave = true;
      this.errorMessage = 'Invalid delivery boy number.';
    } else if (this.getFormattedDate('DD/MM/YYYY', value.date).length == 0) {
      this.disableSave = true;
      this.errorMessage = 'Please enter date of entry.';
    } else if (value.paidAmt < 0) {
      this.disableSave = true;
      this.errorMessage = 'Payment recieved cannot be less than 0.';
    } else if (!this.deliveryBoySelected) {
      const numberToSearch: string = this.entryForm.get('deliveryBoyNumber')?.value;
      if (numberToSearch?.length === 10 && this.deliveryPhoneNumbers.includes(numberToSearch)) {
        this.disableSave = true;
        this.errorMessage = "Delivery person with same number already present. please select from dropdown list.";
      }
    } else if (!this.customerSelected) {
      const numberToSearch: string = this.entryForm.get('customerNumber')?.value;
      if (numberToSearch?.length === 10 && this.customerPhoneNumbers.includes(numberToSearch)) {
        this.disableSave = true;
        this.errorMessage = "Customer with same number already present. please select from dropdown list.";
      }
    }
  }

  customerDataChanged(value: any) {
    if (this.customerSelected) {
      this.customerSelected = false;
      this.entryForm.get('customerId')?.setValue(generateRandomString());
    }

    if (value?.length == 0)
      this.customerSearchList = this.customerList;
    else
      this.customerSearchList = this.customerList.filter((item) =>
        Object.values(item.data || {}).toString()?.toLowerCase()?.includes(value?.toLowerCase())
      );
  }

  shippingAddressDataChanged(value: string) {
    if (this.shippingAddressSelected) {
      this.shippingAddressSelected = false;
    }

    if (value?.length == 0)
      this.shippingAddressSearchList = this.shippingAddressList;
    else
      this.shippingAddressSearchList = this.shippingAddressList.filter((item) =>
        item.toLowerCase()?.includes(value?.toLowerCase())
      );
  }

  deliveryBoyDataChanged(value: any) {
    if (this.deliveryBoySelected) {
      this.deliveryBoySelected = false;
      this.entryForm.get('deliveryBoyUserId')?.setValue(generateRandomString());
    }

    if (value?.length == 0)
      this.deliveryBoysSearchList = this.deliveryBoysList;
    else
      this.deliveryBoysSearchList = this.deliveryBoysList.filter((item) =>
        Object.values(item.data || {}).toString()?.toLowerCase()?.includes(value?.toLowerCase())
      );
  }

  removeProduct(event: any, index: number) {
    event.stopPropagation();

    const product = this.selectedProductList[index];
    this.totalSum -= (product.productData.rate || 0) * product.sentUnits;

    if (this.totalSum < 0) this.totalSum = 0;

    this.selectedProductList.splice(index, 1);
    this.checkForDataValidation(this.entryForm.value);
  }

  submitProductSelection() {
    this.selectedProductList = [];
    this.totalSum = 0;

    for (const item of this.productList) {
      const rateElement = document.getElementById(`rate_${item.data.productId}`) as HTMLInputElement;
      const sentElement = document.getElementById(`sent_${item.data.productId}`) as HTMLInputElement;
      const recievedElement = document.getElementById(`recieved_${item.data.productId}`) as HTMLInputElement;

      if (rateElement && sentElement && recievedElement) {
        const rate = parseInt(rateElement.value);
        const sentUnits = parseInt(sentElement.value);
        const recievedUnits = parseInt(recievedElement.value);

        if (sentUnits && sentUnits > 0 || recievedUnits && recievedUnits > 0) {
          this.selectedProductList.push({
            productData: {
              name: item.data.name,
              rate: sentUnits > 0 ? rate : 0,
              productId: item.data.productId,
              productReturnable: item.data.productReturnable || false
            },
            sentUnits: sentUnits,
            recievedUnits: recievedUnits
          })
          this.totalSum += rate * sentUnits;
        }
      }
    }

    this.focusedFormName = '';
    this.checkForDataValidation(this.entryForm.value);
  }

  getFormattedDate(format: string, date = this.entryForm.get('date')?.value): string {
    const formatted = date ? moment(date).format(format) : '';
    if (formatted === 'Invalid date')
      return '';
    return formatted;
  }

  formatNumber(value?: string) {
    if (!value)
      return '';
    return value.replace(/(\d{5})(\d{5})/, '$1 $2');
  }

  addProduct() {
    this.onCancel.emit();
    this.router.navigate(['/dashboard/warehouse'], { queryParams: { addProduct: true } });
  }

  onfocus(formName: string) {
    this.focusedFormName = formName;

    if (formName === 'productSelect') {
      if (this.productList.length === 0) {
        if (this.isRefreshedForProduct === false) {
          this.notificationService.showNotification({
            heading: 'No product found',
            message: 'No product list found, please refresh and try again.',
            duration: 4000,
            leftBarColor: this.notificationService.color.yellow
          })
          this.isRefreshedForProduct = true;
        } else {
          this.notificationService.showNotification({
            heading: 'No product found',
            message: 'Please add products before making any entry.',
            duration: 4000,
            leftBarColor: this.notificationService.color.red
          })
          this.allowAddProduct = true;
        }
        this.focusedFormName = '';
      } else {
        this.isRefreshedForProduct = false;
        this.allowAddProduct = false;
      }

      setTimeout(() => {
        for (const item of this.selectedProductList) {
          const rateElement = document.getElementById(`rate_${item.productData.productId}`) as HTMLInputElement;
          const sentElement = document.getElementById(`sent_${item.productData.productId}`) as HTMLInputElement;
          const recievedElement = document.getElementById(`recieved_${item.productData.productId}`) as HTMLInputElement;

          if (rateElement && sentElement && recievedElement) {
            rateElement.value = item.productData.rate.toString();
            sentElement.value = item.sentUnits.toString();
            recievedElement.value = item.recievedUnits.toString();
          }
        }
      }, 100);
    }
  }
}
