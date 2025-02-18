import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CustomerComponent } from './customer.component';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account.service';
import { CustomerDataService } from '../../services/customer-data.service';
import { SearchService } from '../../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { NewAccountComponent } from '../new-account/new-account.component';
import { UserCardComponent } from '../../common/user-card/user-card.component';
import { UserDetailsComponent } from '../../common/user-details/user-details.component';
import { EntryDataTableComponent } from '../entry-data-table/entry-data-table.component';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';
import { Database } from '@angular/fire/database';

fdescribe('CustomerComponent', () => {
  let component: CustomerComponent;
  let fixture: ComponentFixture<CustomerComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockCustomerDataService: jasmine.SpyObj<CustomerDataService>;
  let mockSearchService: jasmine.SpyObj<SearchService>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['getUserId']);
    mockCustomerDataService = jasmine.createSpyObj('CustomerDataService', ['hasCustomerData', 'getCustomerData', 'refreshData', 'deleteCustoner', 'getCustomerList']);
    mockSearchService = jasmine.createSpyObj('SearchService', ['searchText$'], {
      searchText$: of('')
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
        CustomerComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: CustomerDataService, useValue: mockCustomerDataService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
        { provide: Database, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    mockAccountService.getUserId.and.returnValue('testUserId');
    mockCustomerDataService.hasCustomerData.and.returnValue(true);
    mockCustomerDataService.getCustomerData.and.returnValue({
      customerList: {
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

  it('should initialize data on ngOnInit', async () => {
    mockAccountService.getUserId.and.returnValue('testUserId');
    mockCustomerDataService.hasCustomerData.and.returnValue(true);
    mockCustomerDataService.getCustomerData.and.returnValue({
      customerList: {
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
    mockCustomerDataService.getCustomerList.and.returnValue({
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
    });

    await component.ngOnInit();
    expect(component.userId).toBe('testUserId');
    expect(component.customerData).toBeDefined();
    expect(component.computedData.customerList.length).toBeGreaterThan(0);
  });

  it('should compute customer data', () => {
    component.customerData = {
      customerList: {
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

    component.computeCustomerData();
    expect(component.computedData.customerList.length).toBeGreaterThan(0);
    expect(component.computedData.lastUpdatedStr).toBeDefined();
  });

  it('should open profile on load if customerUserId is set', () => {
    component.customerUserId = 'testUserId';
    component.customerData = {
      customerList: {
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
    expect(component.selectedCustomer).toBeDefined();
    expect(component.selectedIndex).toBe(0);
  });

  it('should delete profile on onDeleteProfile', () => {
    component.onDeleteProfile('testUserId');
    expect(mockCustomerDataService.deleteCustoner).toHaveBeenCalledWith('testUserId');
  });

  it('should select customer on customerSelected', () => {
    const customer = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'testUserId'
      }
    };

    component.customerSelected(customer, 1);
    expect(component.selectedIndex).toBe(1);
    expect(component.selectedCustomer).toBe(customer);
    expect(component.addNewCustomer).toBeFalse();
  });

  it('should toggle addNewCustomer on onAddNewCustomer', () => {
    component.onAddNewCustomer();
    expect(component.addNewCustomer).toBeTrue();

    component.onAddNewCustomer();
    expect(component.addNewCustomer).toBeFalse();
  });

  it('should refresh customer data on refreshCustomerData', async () => {
    mockCustomerDataService.refreshData.and.returnValue(Promise.resolve());
    mockCustomerDataService.getCustomerData.and.returnValue({
      customerList: {
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

    await component.refreshCustomerData();
    expect(component.customerData).toBeDefined();
    expect(component.computedData.customerList.length).toBeGreaterThan(0);
  });
});