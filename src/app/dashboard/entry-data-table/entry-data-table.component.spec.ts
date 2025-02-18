import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EntryDataTableComponent } from './entry-data-table.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NewEntryComponent } from '../new-entry/new-entry.component';
import { EntryDataService } from '../../services/entry-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { ExportService } from '../../services/export.service';
import { of, Subject } from 'rxjs';
import { Customer } from '../../../assets/models/Customer';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { environment } from '../../../environments/environment';

fdescribe('EntryDataTableComponent', () => {
  let component: EntryDataTableComponent;
  let fixture: ComponentFixture<EntryDataTableComponent>;
  let mockEntryDataService: jasmine.SpyObj<EntryDataService>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;
  let mockEntryDetailModelService: jasmine.SpyObj<EntryDetailModelService>;
  let mockExportService: jasmine.SpyObj<ExportService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    mockEntryDataService = jasmine.createSpyObj('EntryDataService', ['getCustomerTransactionList', 'getDeliveryPersonTransactionList', 'isDataChanged', 'addNewEntry', 'getTransactionList', 'deleteEntry', 'hardRefresh'], {
      isDataChanged: of(true)
    });
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['transactionListRefreshed', 'showNotification', 'somethingWentWrong']);
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['showModel', 'hideModel']);
    mockEntryDetailModelService = jasmine.createSpyObj('EntryDetailModelService', ['showModel']);
    mockExportService = jasmine.createSpyObj('ExportService', ['exportToExcel', 'exportToPdf']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatPaginatorModule,
        NewEntryComponent,
        EntryDataTableComponent
      ],
      providers: [
        { provide: EntryDataService, useValue: mockEntryDataService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService },
        { provide: EntryDetailModelService, useValue: mockEntryDetailModelService },
        { provide: ExportService, useValue: mockExportService },
        { provide: Router, useValue: mockRouter },
        { provide: AngularFireAuth, useValue: {} },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryDataTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    component.isCustomer = false;
    spyOn(component, 'modifyTableStructureToDeliveryType');
    component.ngOnInit();
    expect(component.modifyTableStructureToDeliveryType).toHaveBeenCalled();
  });

  it('should refresh entry data on ngOnChanges', () => {
    spyOn(component, 'refreshEntryData');
    component.ngOnChanges();
    expect(component.refreshEntryData).toHaveBeenCalled();
  });

  it('should set paginator on ngAfterViewInit', () => {
    const paginator = jasmine.createSpyObj('MatPaginator', ['']);
    component.paginator = paginator;
    component.ngAfterViewInit();
    expect(component.dataSource.paginator).toBe(paginator);
  });

  it('should reset paginator on ngAfterViewChecked', () => {
    const paginator = jasmine.createSpyObj('MatPaginator', ['']);
    component.paginator = paginator;
    component.ngAfterViewChecked();
    expect(component.dataSource.paginator).toBe(paginator);
  });

  it('should modify table structure to delivery type', () => {
    component.modifyTableStructureToDeliveryType();
    expect(component.tableStructure[1].key).toBe('customer');
    expect(component.tableStructure.length).toBe(9);
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

  it('should export data to excel', () => {
    component.dataSource.data = [{ date: '2021-01-01' }];
    component.customerObject = { data: { fullName: 'testCustomer' } } as Customer;
    component.export('excel');
    expect(mockExportService.exportToExcel).toHaveBeenCalled();
  });

  it('should export data to pdf', () => {
    component.dataSource.data = [{ date: '2021-01-01' }];
    component.customerObject = { data: { fullName: 'testCustomer' } } as Customer;
    component.export('pdf');
    expect(mockExportService.exportToPdf).toHaveBeenCalled();
  });

  it('should refresh entry data', async () => {
    component.isCustomer = true;
    component.customerObject = { data: { userId: 'testUserId' } } as Customer;
    mockEntryDataService.getCustomerTransactionList.and.returnValue([]);
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

  it('should show more details', () => {
    const object = { transactionId: 'testTransactionId' };
    mockEntryDataService.getTransactionList.and.returnValue({ testTransactionId: {} });
    component.showMore(object);
    expect(mockEntryDetailModelService.showModel).toHaveBeenCalled();
  });

  it('should delete entry', () => {
    const object = { data: { transactionId: 'testTransactionId' } };
    component.deleteEntry(object);
    expect(mockEntryDataService.deleteEntry).toHaveBeenCalledWith(object);
  });

  it('should open profile', () => {
    const obj = { userId: 'testUserId', fullName: 'testUser' };
    component.isCustomer = true;
    component.openProfile(obj);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/delivery'], { queryParams: { userId: 'testUserId' } });
  });

  it('should get template', () => {
    const template = component.getTemplate('amountText');
    expect(template).toBe(component.amountText);
  });

  it('should return displayed columns', () => {
    const columns = component.displayedColumns();
    expect(columns.length).toBe(10);
  });
});