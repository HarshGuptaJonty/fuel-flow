import { TestBed } from '@angular/core/testing';
import { DeliveryPersonDataService } from './delivery-person-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { AccountService } from './account.service';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';
import { DeliveryPerson } from '../../assets/models/DeliveryPerson';

describe('DeliveryPersonDataService', () => {
  let service: DeliveryPersonDataService;
  let mockAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAccountService: jasmine.SpyObj<AccountService>;

  beforeEach(() => {
    mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', ['signOut']);
    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getData', 'setData']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showNotification', 'somethingWentWrong']);
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);

    TestBed.configureTestingModule({
      providers: [
        DeliveryPersonDataService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AccountService, useValue: mockAccountService }
      ]
    });

    service = TestBed.inject(DeliveryPersonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get delivery person data', () => {
    const deliveryPersonData = { deliveryPersonList: { 'user1': { data: { fullName: 'Delivery Person 1' } } } };
    service.setDeliveryPersonData(deliveryPersonData);
    expect(service.getDeliveryPersonData()).toEqual(deliveryPersonData);
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA)).toEqual(JSON.stringify(deliveryPersonData));
  });

  it('should add new delivery person full', async () => {
    const newDeliveryPerson: DeliveryPerson = {
      data: {
        fullName: 'Delivery Person 1',
        phoneNumber: '1234567890',
        address: '',
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

    const result = await service.addNewDeliveryPersonFull(newDeliveryPerson);

    expect(result).toBeTrue();
    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`deliveryPerson/bucket/${newDeliveryPerson.data.userId}`, newDeliveryPerson);
    expect(service.getDeliveryPersonList()['user1']).toEqual(newDeliveryPerson);
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: `${newDeliveryPerson.data.fullName}'s account created.`,
      message: 'New delivery person added successfully.',
      duration: 5000,
      leftBarColor: '#3A7D44'
    });
  });

  it('should handle error when adding new delivery person full', async () => {
    const newDeliveryPerson: DeliveryPerson = {
      data: {
        fullName: 'Delivery Person 1',
        phoneNumber: '1234567890',
        address: '',
        extraNote: '',
        userId: 'user1'
      },
      others: {
        createdBy: 'admin',
        createdTime: Date.now()
      }
    };

    mockFirebaseService.setData.and.returnValue(Promise.reject(false));

    const result = await service.addNewDeliveryPersonFull(newDeliveryPerson);

    expect(result).toBeFalse();
    expect(mockNotificationService.somethingWentWrong).toHaveBeenCalledWith('106');
  });

  it('should delete delivery person', async () => {
    const userId = 'user1';
    mockFirebaseService.setData.and.returnValue(Promise.resolve());

    service.setDeliveryPersonData({
      deliveryPersonList: { 'user1': { data: { fullName: 'Delivery Person 1' } } },
      others: { lastFrereshed: Date.now() }
    });

    await service.deleteDeliveryPerson(userId);

    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`deliveryPerson/bucket/${userId}`, null);
    expect(service.getDeliveryPersonList()['user1']).toBeUndefined();
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'Delivery person profile deleted successfully.',
      duration: 5000,
      leftBarColor: mockNotificationService.color?.green
    });
  });

  it('should refresh data', async () => {
    const latestData = { 'user1': { data: { fullName: 'Delivery Person 1' } } };
    mockFirebaseService.getData.and.returnValue(Promise.resolve(latestData));

    await service.refreshData(true);

    expect(service.getDeliveryPersonList()).toEqual(latestData);
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'Delivery person data refreshed.',
      duration: 5000,
      leftBarColor: mockNotificationService.color?.green
    });
  });

  it('should get address by user ID', () => {
    const deliveryPersonData = { 'user1': { data: { address: '123 Street' } } };
    service.setDeliveryPersonData({ deliveryPersonList: deliveryPersonData });

    expect(service.getAddress('user1')).toBe('123 Street');
    expect(service.getAddress('user2')).toBe('');
  });

  it('should return empty address if user ID is not provided', () => {
    expect(service.getAddress()).toBe('');
  });

  it('should check if delivery person data exists', () => {
    const deliveryPersonData = { deliveryPersonList: { 'user1': { data: { fullName: 'Delivery Person 1' } } } };
    service.setDeliveryPersonData(deliveryPersonData);

    expect(service.hasDeliveryPersonData()).toBeTrue();
  });

  it('should return false if delivery person data does not exist', () => {
    service.setDeliveryPersonData(null);
    expect(service.hasDeliveryPersonData()).toBeFalse();
  });
});