import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InventoryComponent } from './inventory.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NewFullEntryComponent } from './new-full-entry/new-full-entry.component';
import { EntryDataService } from '../../services/entry-data.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CustomerDataService } from '../../services/customer-data.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { ExportService } from '../../services/export.service';
import { of, Subject } from 'rxjs';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let mockEntryDataService: jasmine.SpyObj<EntryDataService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;
  let mockEntryDetailModelService: jasmine.SpyObj<EntryDetailModelService>;
  let mockExportService: jasmine.SpyObj<ExportService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCustomerDataService: jasmine.SpyObj<CustomerDataService>;
  let mockDeliveryPersonDataService: jasmine.SpyObj<DeliveryPersonDataService>;

  beforeEach(waitForAsync(() => {
    mockEntryDataService = jasmine.createSpyObj('EntryDataService', ['getSortedTransactionList', 'addNewEntry', 'getTransactionList', 'deleteEntry', 'hardRefresh'], {
      isDataChanged: of(true)
    });
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['transactionListRefreshed', 'showNotification', 'somethingWentWrong']);
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);
    mockEntryDetailModelService = jasmine.createSpyObj('EntryDetailModelService', ['showModel']);
    mockExportService = jasmine.createSpyObj('ExportService', ['exportToExcel', 'exportToPdf']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockCustomerDataService = jasmine.createSpyObj('CustomerDataService', ['getAddress']);
    mockDeliveryPersonDataService = jasmine.createSpyObj('DeliveryPersonDataService', ['getAddress']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        NewFullEntryComponent,
        InventoryComponent
      ],
      providers: [
        { provide: EntryDataService, useValue: mockEntryDataService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: EntryDetailModelService, useValue: mockEntryDetailModelService },
        { provide: ExportService, useValue: mockExportService },
        { provide: Router, useValue: mockRouter },
        { provide: AngularFireAuth, useValue: {} },
        { provide: CustomerDataService, useValue: mockCustomerDataService },
        { provide: DeliveryPersonDataService, useValue: mockDeliveryPersonDataService },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    spyOn(component, 'refreshEntryData');
    component.ngOnInit();
    expect(component.refreshEntryData).toHaveBeenCalled();
    expect(component.entryDataAvaliable).toBeTrue();
  });

  it('should refresh entry data on ngOnInit when data changes', () => {
    spyOn(component, 'refreshEntryData');
    component.ngOnInit();
    mockEntryDataService.isDataChanged.subscribe(flag => {
      if (flag) {
        expect(component.entryDataAvaliable).toBeTrue();
        expect(component.refreshEntryData).toHaveBeenCalled();
        expect(component.newEntry).toBeFalse();
        expect(component.isRefreshing).toBeFalse();
      }
    });
  });

  it('should set paginator on ngAfterViewChecked', () => {
    const paginator = jasmine.createSpyObj('MatPaginator', ['']);
    component.paginator = paginator;
    component.ngAfterViewChecked();
    expect(component.dataSource.paginator).toBe(paginator);
  });

  it('should export data to excel', () => {
    component.dataSource.data = [{ date: '2021-01-01' }];
    component.export('excel');
    expect(mockExportService.exportToExcel).toHaveBeenCalled();
  });

  it('should export data to pdf', () => {
    component.dataSource.data = [{ date: '2021-01-01' }];
    component.export('pdf');
    expect(mockExportService.exportToPdf).toHaveBeenCalled();
  });

  it('should refresh data', () => {
    spyOn(component, 'refreshEntryData');
    component.isRefreshing = false;
    component.entryDataAvaliable = true;
    component.refreshData();
    expect(component.isRefreshing).toBeTrue();
    setTimeout(() => {
      expect(component.refreshEntryData).toHaveBeenCalled();
      expect(mockNotificationService.transactionListRefreshed).toHaveBeenCalled();
      expect(component.isRefreshing).toBeFalse();
    }, 1000);
  });

  it('should refresh entry data', async () => {
    component.newEntry = false;
    component.pendingUnit = 0;
    component.dueAmount = 0;
    component.rawTransactionList = [];
    component.processedTableData = null;
    component.openTransaction = undefined;

    mockEntryDataService.getSortedTransactionList.and.returnValue([]);
    await component.refreshEntryData();
    expect(component.rawTransactionList.length).toBe(0);
    expect(component.processedTableData).toEqual([]);
  });

  it('should save entry', () => {
    const entry = {} as EntryTransaction;
    component.saveEntry(entry);
    expect(mockEntryDataService.addNewEntry).toHaveBeenCalledWith(entry, false);
  });

  it('should edit entry', () => {
    const object = { transactionId: 'testTransactionId' };
    const showModelSubject = new Subject<any>();
    mockConfirmationModelService.showModel.and.returnValue(showModelSubject);
    component.editEntry(object);
    expect(mockConfirmationModelService.showModel).toHaveBeenCalled();

    showModelSubject.next('left');
    showModelSubject.complete();

    expect(mockConfirmationModelService.hideModel).toHaveBeenCalled();
    expect(component.openTransaction).toBeUndefined();
    expect(component.newEntry).toBeTrue();
  });

  it('should delete entry', () => {
    const object = { data: { transactionId: 'testTransactionId' } };
    component.deleteEntry(object);
    expect(mockEntryDataService.deleteEntry).toHaveBeenCalledWith(object);
  });

  it('should show more details', () => {
    const object = { transactionId: 'testTransactionId' };
    mockEntryDataService.getTransactionList.and.returnValue({ testTransactionId: {} });
    component.showMore(object);
    expect(mockEntryDetailModelService.showModel).toHaveBeenCalled();
  });

  it('should open customer profile', () => {
    const obj = { userId: 'testUserId', fullName: 'testUser' };
    component.openCustomerProfile(obj);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/customers'], { queryParams: { userId: 'testUserId' } });
  });

  it('should open delivery boy profile', () => {
    const obj = { userId: 'testUserId', fullName: 'testUser' };
    component.openDeliveryBoyProfile(obj);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/delivery'], { queryParams: { userId: 'testUserId' } });
  });

  it('should get template', () => {
    const template = component.getTemplate('amountText');
    expect(template).toBe(component.amountText);
  });

  it('should return displayed columns', () => {
    const columns = component.displayedColumns();
    expect(columns.length).toBe(11);
  });
});