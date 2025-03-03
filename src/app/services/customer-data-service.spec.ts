import { TestBed } from '@angular/core/testing';
import { CustomerDataService } from './customer-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AccountService } from './account.service';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { EntryDataService } from './entry-data.service';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { Customer } from '../../assets/models/Customer';

describe('CustomerDataService', () => {
  let service: CustomerDataService;
  let mockAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockEntryDataService: jasmine.SpyObj<EntryDataService>;

  beforeEach(() => {
    mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', ['signOut']);
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getData', 'setData']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showNotification', 'somethingWentWrong']);
    mockEntryDataService = jasmine.createSpyObj('EntryDataService', ['customerHasData']);

    TestBed.configureTestingModule({
      providers: [
        CustomerDataService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: AccountService, useValue: mockAccountService },
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: EntryDataService, useValue: mockEntryDataService }
      ]
    });

    service = TestBed.inject(CustomerDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get customer data', () => {
    const customerData = { customerList: { 'user1': { data: { fullName: 'Customer 1' } } } };
    service.setCustomerData(customerData);
    expect(service.getCustomerData()).toEqual(customerData);
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA)).toEqual(JSON.stringify(customerData));
  });

  it('should add new customer full', async () => {
    const newCustomer: Customer = {
      data: {
        fullName: 'Customer 1',
        phoneNumber: '1234567890',
        address: '',
        shippingAddress: '',
        extraNote: '',
        userId: 'user1'
      },
      others: {
        createdBy: 'admin',
        createdTime: Date.now()
      }
    };

    mockFirebaseService.setData.and.returnValue(Promise.resolve());
    mockAccountService.getUserId.and.returnValue('admin');

    const result = await service.addNewCustomerFull(newCustomer);

    expect(result).toBeTrue();
    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`customer/bucket/${newCustomer.data.userId}`, newCustomer);
    expect(service.getCustomerList()['user1']).toEqual(newCustomer);
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: `${newCustomer.data.fullName}'s account created.`,
      message: 'New customer added successfully.',
      duration: 5000,
      leftBarColor: '#3A7D44'
    });
  });

  it('should delete customer', async () => {
    const userId = 'user1';
    mockEntryDataService.customerHasData.and.returnValue(false);
    mockFirebaseService.setData.and.returnValue(Promise.resolve());

    service.setCustomerData({
      customerList: { 'user1': { data: { fullName: 'Customer 1' } } },
      others: { lastFrereshed: Date.now() }
    });

    await service.deleteCustoner(userId);

    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`customer/bucket/${userId}`, null);
    expect(service.getCustomerList()['user1']).toBeUndefined();
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'Customer profile deleted successfully.',
      duration: 5000,
      leftBarColor: mockNotificationService.color?.green
    });
  });

  it('should handle error when adding new customer full', async () => {
    const newCustomer: Customer = {
      data: {
        fullName: 'Customer 1',
        phoneNumber: '1234567890',
        address: '',
        shippingAddress: [''],
        extraNote: '',
        userId: 'user1'
      },
      others: {
        createdBy: 'admin',
        createdTime: Date.now()
      }
    };

    mockFirebaseService.setData.and.returnValue(Promise.reject(false));

    const result = await service.addNewCustomerFull(newCustomer);

    expect(result).toBeFalse();
    expect(mockNotificationService.somethingWentWrong).toHaveBeenCalledWith('110');
  });

  it('should not delete customer with entries', () => {
    const userId = 'user1';
    mockEntryDataService.customerHasData.and.returnValue(true);

    service.deleteCustoner(userId);

    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'Process denied.',
      message: 'Customer with entries cannot be deleted, please delete the entries first!',
      duration: 7000,
      leftBarColor: mockNotificationService.color?.yellow
    });
  });

  it('should get address by user ID', () => {
    const customerData = { 'user1': { data: { address: '123 Street' } } };
    service.setCustomerData({ customerList: customerData });

    expect(service.getAddress('user1')).toBe('123 Street');
    expect(service.getAddress('user2')).toBe('');
  });

  it('should return empty address if user ID is not provided', () => {
    expect(service.getAddress()).toBe('');
  });

  it('should check if customer data exists', () => {
    const customerData = { customerList: { 'user1': { data: { fullName: 'Customer 1' } } } };
    service.setCustomerData(customerData);

    expect(service.hasCustomerData()).toBeTrue();
  });

  it('should return false if customer data does not exist', () => {
    service.setCustomerData(null);
    expect(service.hasCustomerData()).toBeFalse();
  });
});