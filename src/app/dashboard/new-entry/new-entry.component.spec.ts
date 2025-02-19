import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewEntryComponent } from './new-entry.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AccountService } from '../../services/account.service';
import { EntryDataService } from '../../services/entry-data.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { of, Subject } from 'rxjs';
import moment from 'moment';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('NewEntryComponent', () => {
  let component: NewEntryComponent;
  let fixture: ComponentFixture<NewEntryComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockEntryDataService: jasmine.SpyObj<EntryDataService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockEntryDataService = jasmine.createSpyObj('EntryDataService', ['isDataChanged'], {
      isDataChanged: of(true)
    });
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['getDeliveryPersonList', 'hasDeliveryPersonData', 'addNewDeliveryPerson', 'getAddress']);

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
        NewEntryComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: EntryDataService, useValue: mockEntryDataService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        provideNgxMask(),
        provideAnimations()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewEntryComponent);
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
        customer: { fullName: 'John Doe', phoneNumber: '9234567890', userId: 'cust123' },
        deliveryBoy: { fullName: 'Jane Doe', phoneNumber: '9987654321', userId: 'del123' },
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
    // expect(component.entryForm.value.date).toEqual(moment('01/01/2021', 'DD/MM/YYYY').toDate());
    expect(component.entryForm.value.unitsSent).toBe(10);
    expect(component.entryForm.value.unitsRecieved).toBe(5);
    expect(component.entryForm.value.rate).toBe(100);
    expect(component.entryForm.value.paidAmt).toBe(500);
    expect(component.entryForm.value.deliveryBoyName).toBe('Jane Doe');
    expect(component.entryForm.value.deliveryBoyNumber).toBe('9987654321');
    expect(component.entryForm.value.deliveryBoyAddress).toBe(null);
    expect(component.entryForm.value.extraDetails).toBe('Extra details');
  });

  it('should save entry', () => {
    const entry = {
      date: moment().toDate(),
      unitsSent: 10,
      unitsRecieved: 5,
      rate: 100,
      paidAmt: 500,
      deliveryBoyName: 'Jane Doe',
      deliveryBoyNumber: '9987654321',
      deliveryBoyAddress: '123 Street',
      extraDetails: 'Extra details',
      deliveryBoyUserId: 'del123'
    };

    component.entryForm.setValue(entry);
    spyOn(component.onSubmit, 'emit');
    spyOn(mockEntryDataService.isDataChanged, 'subscribe');
    component.onSaveClick();

    expect(mockEntryDataService.isDataChanged.subscribe).toHaveBeenCalled();
    expect(component.onSubmit.emit).toHaveBeenCalled();
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
      deliveryBoyName: 'Jane Doe',
      deliveryBoyNumber: '9987654321',
      deliveryBoyAddress: '123 Street',
      extraDetails: 'Extra details',
      deliveryBoyUserId: 'del123'
    };

    component.checkForDataValidation(value);
    expect(component.disableSave).toBeFalse();
    expect(component.errorMessage).toBeUndefined();
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
    component.onfocus('deliveryBoyName');
    expect(component.focusedFormName).toBe('deliveryBoyName');
  });
});