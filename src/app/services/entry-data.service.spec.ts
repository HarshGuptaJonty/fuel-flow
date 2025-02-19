import { TestBed } from '@angular/core/testing';
import { EntryDataService } from './entry-data.service';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EntryTransaction } from '../../assets/models/EntryTransaction';

describe('EntryDataService', () => {
  let service: EntryDataService;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;

  beforeEach(() => {
    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getData', 'setData']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showNotification', 'somethingWentWrong', 'transactionListRefreshed']);
    mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', ['signOut']);

    TestBed.configureTestingModule({
      providers: [
        EntryDataService,
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AngularFireAuth, useValue: mockAngularFireAuth }
      ]
    });

    service = TestBed.inject(EntryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with data', async () => {
    const transactionData = { 'trans1': { data: { transactionId: 'trans1' } } };
    mockFirebaseService.getData.and.returnValue(Promise.resolve(transactionData));

    await service['initialize']();

    service.transactionList$.subscribe(data => {
      expect(data).toEqual(transactionData);
    });

    service.isDataChanged.subscribe(changed => {
      expect(changed).toBeTrue();
    });
  });

  it('should initialize with no data', async () => {
    mockFirebaseService.getData.and.returnValue(Promise.resolve({}));

    await service['initialize']();

    service.transactionList$.subscribe(data => {
      expect(data).toBeNull();
    });

    service.isDataChanged.subscribe(changed => {
      expect(changed).toBeFalse();
    });
  });

  it('should add new entry', async () => {
    const newEntry: EntryTransaction = {
      data: {
        transactionId: 'trans1',
        customer: { userId: 'cust1' },
        deliveryBoy: { userId: 'del1' }
      },
      others: {
        createdBy: 'admin',
        createdTime: Date.now()
      }
    };

    mockFirebaseService.setData.and.returnValue(Promise.resolve());

    await service.addNewEntry(newEntry);

    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`transactionList/${newEntry.data.transactionId}`, newEntry);
    expect(service.getTransactionList()['trans1']).toEqual(newEntry);
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'New entry added.',
      message: 'Data saved successfully.',
      duration: 5000,
      leftBarColor: mockNotificationService.color?.green
    });
  });

  // it('should handle error when adding new entry', async () => {
  //   const newEntry: EntryTransaction = {
  //     data: {
  //       transactionId: 'trans1',
  //       customer: { userId: 'cust1' },
  //       deliveryBoy: { userId: 'del1' }
  //     },
  //     others: {
  //       createdBy: 'admin',
  //       createdTime: Date.now()
  //     }
  //   };

  //   mockFirebaseService.setData.and.returnValue(Promise.reject(new Error('Error')));
  //   spyOn(service.isDataChanged, 'next');

  //   await service.addNewEntry(newEntry);

  //   expect(mockNotificationService.somethingWentWrong).toHaveBeenCalledWith('102');
  //   expect(service.isDataChanged.next).toHaveBeenCalledWith(false);
  // });

  it('should delete entry', async () => {
    const entry: EntryTransaction = {
      data: {
        transactionId: 'trans1',
        customer: { userId: 'cust1' },
        deliveryBoy: { userId: 'del1' }
      },
      others: {
        createdBy: 'admin',
        createdTime: Date.now()
      }
    };

    mockFirebaseService.setData.and.returnValue(Promise.resolve());

    await service.deleteEntry(entry);

    expect(mockFirebaseService.setData).toHaveBeenCalledWith(`transactionList/${entry.data.transactionId}`, null);
    expect(service.getTransactionList()['trans1']).toBeUndefined();
    expect(mockNotificationService.showNotification).toHaveBeenCalledWith({
      heading: 'Entry deleted!',
      message: 'Data erased successfully.',
      duration: 5000,
      leftBarColor: mockNotificationService.color?.green
    });
  });

  // it('should handle error when deleting entry', async () => {
  //   const entry: EntryTransaction = {
  //     data: {
  //       transactionId: 'trans1',
  //       customer: { userId: 'cust1' },
  //       deliveryBoy: { userId: 'del1' }
  //     },
  //     others: {
  //       createdBy: 'admin',
  //       createdTime: Date.now()
  //     }
  //   };

  //   mockFirebaseService.setData.and.returnValue(Promise.reject());
  //   spyOn(service.isDataChanged, 'next');

  //   await service.deleteEntry(entry);
    
  //   expect(mockNotificationService.somethingWentWrong).toHaveBeenCalledWith('103');
  //   expect(service.isDataChanged.next).toHaveBeenCalledWith(false);
  // });

  it('should get customer transaction list', () => {
    const transactionData = {
      'trans1': { data: { transactionId: 'trans1', customer: { userId: 'cust1' } } },
      'trans2': { data: { transactionId: 'trans2', customer: { userId: 'cust2' } } }
    };
    service['transactionList'].next(transactionData);

    const result = service.getCustomerTransactionList('cust1');
    expect(result.length).toBe(1);
    expect(result[0].data.transactionId).toBe('trans1');
  });

  it('should get delivery person transaction list', () => {
    const transactionData = {
      'trans1': { data: { transactionId: 'trans1', deliveryBoy: { userId: 'del1' } } },
      'trans2': { data: { transactionId: 'trans2', deliveryBoy: { userId: 'del2' } } }
    };
    service['transactionList'].next(transactionData);

    const result = service.getDeliveryPersonTransactionList('del1');
    expect(result.length).toBe(1);
    expect(result[0].data.transactionId).toBe('trans1');
  });

  it('should get sorted transaction list', () => {
    const transactionData = {
      'trans2': { data: { transactionId: 'trans2' } },
      'trans1': { data: { transactionId: 'trans1' } }
    };
    service['transactionList'].next(transactionData);

    const result = service.getSortedTransactionList();
    expect(result.length).toBe(2);
    expect(result[0].data.transactionId).toBe('trans1');
    expect(result[1].data.transactionId).toBe('trans2');
  });

  it('should check if customer has data', () => {
    const transactionData = {
      'trans1': { data: { transactionId: 'trans1', customer: { userId: 'cust1' } } },
      'trans2': { data: { transactionId: 'trans2', customer: { userId: 'cust2' } } }
    };
    service['transactionList'].next(transactionData);

    expect(service.customerHasData('cust1')).toBeTrue();
    expect(service.customerHasData('cust3')).toBeFalse();
  });
});