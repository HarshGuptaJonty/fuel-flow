import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { AccountService } from '../services/account.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CustomerDataService } from '../services/customer-data.service';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmationModelService } from '../services/confirmation-model.service';
import { AdminDataService } from '../services/admin-data.service';
import { DeliveryPersonDataService } from '../services/delivery-person-data.service';
import { of, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAccountService: jasmine.SpyObj<AccountService>;
  let mockCustomerService: jasmine.SpyObj<CustomerDataService>;
  let mockSearchService: jasmine.SpyObj<SearchService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;
  let mockAdminDataService: jasmine.SpyObj<AdminDataService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(waitForAsync(() => {
    mockAccountService = jasmine.createSpyObj('AccountService', ['hasUserData', 'getUserData', 'getUserId', 'setUserData', 'signOut']);
    mockCustomerService = jasmine.createSpyObj('CustomerDataService', ['getCustomerList']);
    mockCustomerService.getCustomerList.and.returnValue({});
    mockSearchService = jasmine.createSpyObj('SearchService', ['updateSearchText']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['notAuthorized', 'loggedOut']);
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);
    mockAdminDataService = jasmine.createSpyObj('AdminDataService', ['getAdminData']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['getDeliveryPersonList']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      firstChild: {
        url: of([{ path: 'customers' }])
      }
    };

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        DashboardComponent
      ],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: CustomerDataService, useValue: mockCustomerService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: AdminDataService, useValue: mockAdminDataService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    mockAccountService.hasUserData.and.returnValue(true);
    mockAccountService.getUserData.and.returnValue({ data: { userID: 'testUserId', profilePicLink: 'testLink' } });
    component.ngOnInit();
    expect(component.userData).toEqual({ data: { userID: 'testUserId', profilePicLink: 'testLink' } });
    expect(component.adminProfileData).toEqual({ userID: 'testUserId', profilePicLink: 'testLink' });
    expect(component.profilePicLink).toBe('testLink');
  });

  it('should handle navigation end event', () => {
    const navigationEnd = new NavigationEnd(1, '/', '/');
    Object.defineProperty(mockRouter, 'events', { value: of(navigationEnd).pipe(filter(event => event instanceof NavigationEnd)) });
    component.ngOnInit();
    expect(component.activeNavMenu).toBe('customers');
  });

  it('should handle window resize event', () => {
    spyOn(component, 'onResize');
    component.ngOnInit();
    window.dispatchEvent(new Event('resize'));
    expect(component.onResize).toHaveBeenCalled();
  });

  it('should handle document click event', () => {
    const event = new Event('click');
    spyOn(component, 'clickout');
    document.dispatchEvent(event);
    expect(component.clickout).toHaveBeenCalled();
  });

  it('should handle search input', () => {
    const event = { target: { value: 'test' } };
    component.onSearch(event);
    expect(mockSearchService.updateSearchText).toHaveBeenCalledWith('test');
  });

  it('should enable menu item', () => {
    component.enableMenuItem('customers', false);
    expect(component.menuItemList.find(item => item.key === 'customers')?.enable).toBeFalse();
  });

  it('should set menu item visibility', () => {
    component.visibleMenuItem('customers', false);
    expect(component.menuItemList.find(item => item.key === 'customers')?.visible).toBeFalse();
  });

  it('should set menu item visibility in specific menu', () => {
    component.visibleInMenuItem('customers', 'side');
    expect(component.menuItemList.find(item => item.key === 'customers')?.visibleIn).toBe('side');
  });

  it('should check if customer data exists', () => {
    mockCustomerService.getCustomerList.and.returnValue({ 'cust123': {} });
    expect(component.hasCustomerData()).toBeTrue();
  });

  it('should check if delivery person data exists', () => {
    mockDeliveryPersonDataService.getDeliveryPersonList.and.returnValue({ 'del123': {} });
    expect(component.hasDeliveryPersonData()).toBeTrue();
  });

  it('should handle navigation menu item click', () => {
    spyOn(component, 'navMenuItemClicked');
    component.navMenuItemClicked('customers');
    expect(component.navMenuItemClicked).toHaveBeenCalledWith('customers');
  });

  it('should handle logout', () => {
    const showModelSubject = new Subject<any>();
    mockConfirmationModelService.showModel.and.returnValue(showModelSubject);
    component.navMenuItemClicked('log-out');
    expect(mockConfirmationModelService.showModel).toHaveBeenCalled();

    showModelSubject.next('left');
    showModelSubject.complete();

    expect(mockConfirmationModelService.hideModel).toHaveBeenCalled();
    expect(mockAccountService.signOut).toHaveBeenCalled();
    expect(mockNotificationService.loggedOut).toHaveBeenCalled();
  });
});