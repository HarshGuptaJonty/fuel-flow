import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DeliveryPersonComponent } from './delivery-person.component';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { SearchService } from '../../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NewAccountComponent } from '../new-account/new-account.component';
import { UserCardComponent } from '../../common/user-card/user-card.component';
import { UserDetailsComponent } from '../../common/user-details/user-details.component';
import { EntryDataTableComponent } from '../entry-data-table/entry-data-table.component';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';
import { Database } from '@angular/fire/database';

describe('DeliveryPersonComponent', () => {
  let component: DeliveryPersonComponent;
  let fixture: ComponentFixture<DeliveryPersonComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;
  let mockSearchService: jasmine.SpyObj<SearchService>;
  let mockActivatedRoute: any;
  let searchTextSubject: Subject<string>;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['hasDeliveryPersonData', 'getDeliveryPersonData', 'refreshData', 'deleteDeliveryPerson', 'getDeliveryPersonList']);
    searchTextSubject = new Subject<string>();
    mockSearchService = jasmine.createSpyObj('SearchService', [], {
      searchText$: searchTextSubject.asObservable()
    });
    mockActivatedRoute = {
      queryParams: of({ userId: 'testUserId' })
    };

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NewAccountComponent,
        UserCardComponent,
        UserDetailsComponent,
        EntryDataTableComponent,
        DeliveryPersonComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
        { provide: Database, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryPersonComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockAccountService.getUserId.and.returnValue('testUserId');
    mockDeliveryPersonDataService.hasDeliveryPersonData.and.returnValue(true);
    mockDeliveryPersonDataService.getDeliveryPersonData.and.returnValue({
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      },
      others: {
        lastFrereshed: Date.now()
      }
    });

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    mockAccountService.getUserId.and.returnValue('testUserId');
    mockDeliveryPersonDataService.hasDeliveryPersonData.and.returnValue(true);
    mockDeliveryPersonDataService.getDeliveryPersonData.and.returnValue({
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      },
      others: {
        lastFrereshed: Date.now()
      }
    });

    component.ngOnInit();
    expect(component.userId).toBe('testUserId');
    expect(component.deliveryPersonData).toBeDefined();
    expect(component.computedData.deliveryPersonList.length).toBeGreaterThan(0);
  });

  it('should compute delivery person data', () => {
    component.deliveryPersonData = {
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      },
      others: {
        lastFrereshed: Date.now()
      }
    };

    component.computeDeliveryPersonData();
    expect(component.computedData.deliveryPersonList.length).toBeGreaterThan(0);
    expect(component.computedData.lastUpdatedStr).toBeDefined();
  });

  it('should open profile on load if deliveryPersonUserId is set', () => {
    component.deliveryPersonUserId = 'testUserId';
    component.deliveryPersonData = {
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      }
    };

    component.openProfileOnLoad();
    expect(component.selectedDeliveryPerson).toBeDefined();
    expect(component.selectedIndex).toBe(0);
  });

  it('should delete profile on onDeleteProfile', () => {
    component.onDeleteProfile('testUserId');
    expect(mockDeliveryPersonDataService.deleteDeliveryPerson).toHaveBeenCalledWith('testUserId');
  });

  it('should select delivery person on userSelected', () => {
    const deliveryPerson = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'testUserId'
      }
    };

    component.userSelected(deliveryPerson, 1);
    expect(component.selectedIndex).toBe(1);
    expect(component.selectedDeliveryPerson).toBe(deliveryPerson);
    expect(component.addNewDeliveryBoy).toBeFalse();
  });

  it('should toggle addNewDeliveryBoy on onAddNewDeliveryBoy', () => {
    component.onAddNewDeliveryBoy();
    expect(component.addNewDeliveryBoy).toBeTrue();

    component.onAddNewDeliveryBoy();
    expect(component.addNewDeliveryBoy).toBeFalse();
  });

  it('should refresh delivery person data on refreshDeliveryPersonData', async () => {
    mockDeliveryPersonDataService.refreshData.and.returnValue(Promise.resolve());
    mockDeliveryPersonDataService.getDeliveryPersonData.and.returnValue({
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      },
      others: {
        lastFrereshed: Date.now()
      }
    });

    await component.refreshDeliveryPersonData();
    expect(component.deliveryPersonData).toBeDefined();
    expect(component.computedData.deliveryPersonList.length).toBeGreaterThan(0);
  });

  it('should filter delivery person list based on search text', () => {
    component.deliveryPersonData = {
      deliveryPersonList: {
        testUserId: {
          data: {
            fullName: 'testData',
            phoneNumber: '1234567890',
            userId: 'testUserId'
          },
          others: {
            createdTime: Date.now()
          }
        }
      }
    };

    component.ngOnInit();

    searchTextSubject.next('test');
    expect(component.computedData.deliveryPersonList.length).toBeGreaterThan(0);
    expect(component.isSearching).toBeTrue();

    searchTextSubject.next('');
    expect(component.computedData.deliveryPersonList.length).toBeGreaterThan(0);
    expect(component.isSearching).toBeFalse();
  });
});