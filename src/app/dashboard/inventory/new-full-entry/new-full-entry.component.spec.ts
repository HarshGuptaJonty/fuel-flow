import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewFullEntryComponent } from './new-full-entry.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { EntryTransaction } from '../../../../assets/models/EntryTransaction';
import { AccountService } from '../../../services/account.service';
import { ConfirmationModelService } from '../../../services/confirmation-model.service';
import { DeliveryPersonDataService } from '../../../services/delivery-person-data.service';
import { EntryDataService } from '../../../services/entry-data.service';
import { CustomerDataService } from '../../../services/customer-data.service';
import { of, Subject } from 'rxjs';
import moment from 'moment';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('NewFullEntryComponent', () => {
  let component: NewFullEntryComponent;
  let fixture: ComponentFixture<NewFullEntryComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockEntryDataService: jasmine.SpyObj<EntryDataService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;
  let mockCustomerDataService: jasmine.SpyObj<CustomerDataService>;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockEntryDataService = jasmine.createSpyObj('EntryDataService', ['isDataChanged'], {
      isDataChanged: of(true)
    });
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['getDeliveryPersonList', 'hasDeliveryPersonData', 'addNewDeliveryPerson']);
    mockCustomerDataService = jasmine.createSpyObj('CustomerDataService', ['getCustomerList', 'getCustomerData', 'addNewCustomer']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMaskDirective,
        MatButtonModule,
        MatNativeDateModule,
        MatDatepickerModule,
        NewFullEntryComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: EntryDataService, useValue: mockEntryDataService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        { provide: CustomerDataService, useValue: mockCustomerDataService },
        provideNgxMask(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewFullEntryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    component.openTransaction = {
      data: {
        date: '01/01/2021',
        sent: 10,
        recieved: 5,
        rate: 100,
        payment: 500,
        customer: { fullName: 'John Doe', phoneNumber: '1234567890', userId: 'cust123' },
        deliveryBoy: { fullName: 'Jane Doe', phoneNumber: '0987654321', userId: 'del123' },
        transactionId: 'trans123',
        extraDetails: 'Extra details'
      },
      others: {
        createdBy: 'user123',
        createdTime: 1610000000000,
        editedBy: 'user456',
        editedTime: 1610000000000
      }
    } as EntryTransaction;

    component.ngOnInit();
    expect(component.isEditing).toBeTrue();
    expect(component.transactionId).toBe('trans123');
    expect(component.entryForm.value.unitsSent).toBe(10);
    expect(component.entryForm.value.unitsRecieved).toBe(5);
    expect(component.entryForm.value.rate).toBe(100);
    expect(component.entryForm.value.paidAmt).toBe(500);
    expect(component.entryForm.value.customerName).toBe('John Doe');
    expect(component.entryForm.value.customerNumber).toBe('1234567890');
    expect(component.entryForm.value.customerId).toBe('cust123');
    expect(component.entryForm.value.deliveryBoyName).toBe('Jane Doe');
    expect(component.entryForm.value.deliveryBoyNumber).toBe('0987654321');
    expect(component.entryForm.value.deliveryBoyUserId).toBe('del123');
    expect(component.entryForm.value.extraDetails).toBe('Extra details');
  });

  it('should save entry', () => {
    const entry = {
      date: moment().toDate(),
      unitsSent: 10,
      unitsRecieved: 5,
      rate: 100,
      paidAmt: 500,
      customerName: 'John Doe',
      customerNumber: '1234567890',
      customerId: 'cust123',
      deliveryBoyName: 'Jane Doe',
      deliveryBoyNumber: '0987654321',
      deliveryBoyUserId: 'del123',
      extraDetails: 'Extra details'
    };
    spyOn(mockEntryDataService.isDataChanged, 'subscribe');

    component.entryForm.setValue(entry);
    component.onSaveClick();

    expect(mockEntryDataService.isDataChanged.subscribe).toHaveBeenCalled();
    expect(component.disableSave).toBeTrue();
  });

  it('should delete entry', () => {
    const showModelSubject = new Subject<any>();
    mockConfirmationModelService.showModel.and.returnValue(showModelSubject);
    spyOn(component.onDelete, 'emit');
    component.onDeleteClick();
    expect(mockConfirmationModelService.showModel).toHaveBeenCalled();

    showModelSubject.next('left');
    showModelSubject.complete();

    expect(mockConfirmationModelService.hideModel).toHaveBeenCalled();
    expect(component.onDelete.emit).toHaveBeenCalled();
  });

  it('should cancel entry', () => {
    spyOn(component.onCancel, 'emit');
    component.onCancelClick();
    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should validate form data', () => {
    const value = {
      date: moment().toDate(),
      unitsSent: 10,
      unitsRecieved: 5,
      rate: 100,
      paidAmt: 500,
      customerName: 'John Doe',
      customerNumber: '7234567890',
      customerId: 'cust123',
      deliveryBoyName: 'Jane Doe',
      deliveryBoyNumber: '7987654321',
      deliveryBoyUserId: 'del123',
      extraDetails: 'Extra details'
    };

    component.checkForDataValidation(value);
    expect(component.disableSave).toBeFalse();
    expect(component.errorMessage).toBeUndefined();
  });

  it('should handle customer data change', () => {
    component.customerSelected = true;
    component.customerDataChanged('John');
    expect(component.customerSelected).toBeFalse();
    expect(component.entryForm.get('customerId')?.value).toBeDefined();
  });

  it('should handle delivery boy data change', () => {
    component.deliveryBoySelected = true;
    component.deliveryBoyDataChanged('Jane');
    expect(component.deliveryBoySelected).toBeFalse();
    expect(component.entryForm.get('deliveryBoyUserId')?.value).toBeDefined();
  });

  it('should get formatted date', () => {
    component.entryForm.get('date')?.setValue(moment('01/01/2021', 'DD/MM/YYYY').toDate());
    const formattedDate = component.getFormattedDate('DD/MM/YYYY');
    expect(formattedDate).toBe('01/01/2021');
  });

  it('should format number', () => {
    const formattedNumber = component.formatNumber('1234567890');
    expect(formattedNumber).toBe('1234 567 890');
  });

  it('should handle focus', () => {
    component.onfocus('customerName');
    expect(component.focusedFormName).toBe('customerName');
  });
});