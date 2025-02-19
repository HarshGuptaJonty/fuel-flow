import { TestBed } from '@angular/core/testing';
import { EntryDetailModelService } from './entry-detail-model.service';
import { AdminDataService } from './admin-data.service';
import { EntryTransaction, UserData } from '../../assets/models/EntryTransaction';

describe('EntryDetailModelService', () => {
  let service: EntryDetailModelService;
  let mockAdminDataService: jasmine.SpyObj<AdminDataService>;

  beforeEach(() => {
    mockAdminDataService = jasmine.createSpyObj('AdminDataService', ['getAdminName']);

    TestBed.configureTestingModule({
      providers: [
        EntryDetailModelService,
        { provide: AdminDataService, useValue: mockAdminDataService }
      ]
    });

    service = TestBed.inject(EntryDetailModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show model and set entry data', () => {
    const entry: EntryTransaction = {
      data: {
        transactionId: 'trans1',
        customer: { fullName: 'Customer 1', phoneNumber: '1234567890', userId: 'cus1' },
        deliveryBoy: { fullName: 'Delivery Boy 1', phoneNumber: '0987654321', userId: 'del1' },
        date: '01/01/2021',
        sent: 10,
        recieved: 5,
        rate: 100,
        payment: 500,
        extraDetails: 'Extra details'
      },
      others: {
        createdBy: 'admin1',
        createdTime: 1610000000000,
        editedBy: 'admin2',
        editedTime: 1610000000000
      }
    };

    mockAdminDataService.getAdminName.and.callFake((userId: string) => {
      if (userId === 'admin1') return 'Admin 1';
      if (userId === 'admin2') return 'Admin 2';
      return 'Unknown';
    });

    service.showModel(entry);

    service.entryData$.subscribe(data => {
      expect(data).toEqual({
        transactionId: 'trans1',
        cName: 'Customer 1',
        cNumber: '1234 567 890',
        date: '01 January 2021',
        sent: 10,
        recieved: 5,
        rate: 100,
        totalAmt: 1000,
        paymentAmt: 500,
        paymentDueAmt: 500,
        dName: 'Delivery Boy 1',
        dNumber: '0987 654 321',
        dId: 'del1',
        extraDetails: 'Extra details',
        createdBy: 'Admin 1',
        createdTime: '07 January 2021 at 11:43:20 am',
        editedBy: 'Admin 2',
        editedTime: '07 January 2021 at 11:43:20 am'
      });
    });

    expect(service.getDeliveryBoyData()).toEqual(entry.data.deliveryBoy);
  });

  it('should hide model and clear entry data', () => {
    service.hideModel();

    service.entryData$.subscribe(data => {
      expect(data).toBeNull();
    });
  });

  it('should format date correctly', () => {
    const formattedDate = service.formatDate('01/01/2021');
    expect(formattedDate).toBe('01 January 2021');
  });

  it('should return null for invalid date', () => {
    const formattedDate = service.formatDate(undefined);
    expect(formattedDate).toBeNull();
  });

  it('should format date and time correctly', () => {
    const formattedDateTime = service.formatDateAndTime(1610000000000);
    expect(formattedDateTime).toBe('07 January 2021 at 11:43:20 am');
  });

  it('should return null for invalid timestamp', () => {
    const formattedDateTime = service.formatDateAndTime(undefined);
    expect(formattedDateTime).toBeNull();
  });
});