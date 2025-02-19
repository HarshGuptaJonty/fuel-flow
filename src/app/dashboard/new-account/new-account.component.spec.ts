import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NewAccountComponent } from './new-account.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CustomerDataService } from '../../services/customer-data.service';
import { AccountService } from '../../services/account.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { Subject } from 'rxjs';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('NewAccountComponent', () => {
  let component: NewAccountComponent;
  let fixture: ComponentFixture<NewAccountComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockCustomerService: jasmine.SpyObj<CustomerDataService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockCustomerService = jasmine.createSpyObj('CustomerDataService', ['hasCustomerData', 'getCustomerList', 'addNewCustomerFull']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['hasDeliveryPersonData', 'getDeliveryPersonList', 'addNewDeliveryPersonFull']);
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMaskDirective,
        MatButtonModule,
        NewAccountComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: CustomerDataService, useValue: mockCustomerService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
        provideNgxMask(),
        provideAnimations(),
        AngularFireAuth
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAccountComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form on ngOnInit', () => {
    mockAccountService.getUserId.and.returnValue('testUserId');
    mockCustomerService.hasCustomerData.and.returnValue(true);
    mockCustomerService.getCustomerList.and.returnValue({
      'cust123': { data: { phoneNumber: '1234567890' } }
    });

    component.userType = 'customer';
    component.ngOnInit();

    expect(component.isCustomerType).toBeTrue();
    expect(component.userId).toBe('testUserId');
    expect(component.phoneNumbers).toEqual(['1234567890']);
    expect(component.accountId).toBeDefined();
  });

  it('should save account data', async () => {
    component.userType = 'customer';
    component.isEditingProfile = false;
    component.accountForm.setValue({
      fullName: 'John Doe',
      phoneNumber: '1234567890',
      address: '123 Street',
      shippingAddress: '456 Avenue',
      extraNote: 'Note',
      userId: ''
    });

    spyOn(component.onCancel, 'emit');
    mockCustomerService.addNewCustomerFull.and.returnValue(Promise.resolve(true));

    await component.saveAccountData();

    expect(mockCustomerService.addNewCustomerFull).toHaveBeenCalled();
    expect(component.onCancel.emit).toHaveBeenCalled();
  });

  it('should delete account', () => {
    const showModelSubject = new Subject<any>();
    mockConfirmationModelService.showModel.and.returnValue(showModelSubject);
    spyOn(component.onCancel, 'emit');
    spyOn(component.onDelete, 'emit');

    component.deleteClicked();
    expect(mockConfirmationModelService.showModel).toHaveBeenCalled();

    showModelSubject.next('left');
    showModelSubject.complete();

    expect(mockConfirmationModelService.hideModel).toHaveBeenCalled();
    expect(component.onCancel.emit).toHaveBeenCalled();
    expect(component.onDelete.emit).toHaveBeenCalled();
  });

  it('should validate duplicate phone number', () => {
    component.phoneNumbers = ['1234567890'];
    component.isEditingProfile = false;

    const control = new FormControl('1234567890');
    const result = component.duplicateNumberValidator(control);

    expect(result).toEqual({ duplicate: true });
  });

  it('should get error message for phone number', () => {
    component.accountForm.controls['phoneNumber'].setErrors({ required: true });
    let errorMessage = component.getErrorMessage('phoneNumber');
    expect(errorMessage).toBe('Please enter phone number.');

    component.accountForm.controls['phoneNumber'].setErrors({ minlength: true });
    errorMessage = component.getErrorMessage('phoneNumber');
    expect(errorMessage).toBe('Please enter 10 digit phone number.');

    component.accountForm.controls['phoneNumber'].setErrors({ duplicate: true });
    errorMessage = component.getErrorMessage('phoneNumber');
    expect(errorMessage).toBe('Account with this number already present.');

    component.accountForm.controls['phoneNumber'].setErrors({ pattern: true });
    errorMessage = component.getErrorMessage('phoneNumber');
    expect(errorMessage).toBe('Please enter a valid Indian phone number.');
  });

  it('should cancel account creation', () => {
    spyOn(component.onCancel, 'emit');
    component.cancelClicked();
    expect(component.onCancel.emit).toHaveBeenCalled();
  });
});