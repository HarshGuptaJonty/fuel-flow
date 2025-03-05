import { CommonModule } from '@angular/common';
import { AfterViewChecked, AfterViewInit, Component, Input, OnChanges, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { dateConverter } from '../../shared/commonFunctions';
import { MatButtonModule } from '@angular/material/button';
import { NewFullEntryComponent } from "../inventory/new-full-entry/new-full-entry.component";
import { EntryDataService } from '../../services/entry-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { InventoryExportEntry } from '../../../assets/models/ExportEntry';
import { ExportService } from '../../services/export.service';
import { DeliveryPerson } from '../../../assets/models/DeliveryPerson';

@Component({
  selector: 'app-entry-data-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    NewFullEntryComponent,
    MatPaginatorModule
  ],
  templateUrl: './entry-data-table.component.html',
  styleUrl: './entry-data-table.component.scss'
})
export class EntryDataTableComponent implements OnInit, OnChanges, AfterViewInit, AfterViewChecked {

  @Input() customerObject?: Customer;
  @Input() deliveryPersonObject?: DeliveryPerson;
  @Input() isCustomer = true;

  @ViewChild('plainText', { static: true }) plainText!: TemplateRef<any>;
  @ViewChild('amountText', { static: true }) amountText!: TemplateRef<any>;
  @ViewChild('nameText', { static: true }) nameText!: TemplateRef<any>;
  @ViewChild('actionText', { static: true }) actionText!: TemplateRef<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tableStructure = [
    {
      key: 'date',
      label: 'Date',
      dataType: 'plainText'
    }, {
      key: 'deliveryBoy',
      label: 'Delivery Boy',
      customClass: 'witdh-limit-200',
      dataType: 'nameText'
    }, {
      key: 'shippingAddress',
      label: 'Address',
      customClass: 'witdh-limit-200',
      dataType: 'plainText'
    }, {
      key: 'sent',
      label: 'Sent',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'recieved',
      label: 'Recieved',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'pending',
      label: 'Pending',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'rate',
      label: 'Rate/Unit',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'totamAmt',
      label: 'Total Amount',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'paymentAmt',
      label: 'Payment',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'dueAmt',
      label: 'Due Amount',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'action',
      label: 'Action',
      customClass: 'text-right',
      dataType: 'actionText'
    }
  ]

  pendingUnit = 0;
  dueAmount = 0;
  processedTableData?: any;
  rawTransactionList: EntryTransaction[] = [];
  newEntry = false;
  entryDataAvaliable = false;
  openTransaction?: EntryTransaction;
  isRefreshing = false;

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private afAuth: AngularFireAuth,
    private enterDataService: EntryDataService,
    private notificationService: NotificationService,
    private confirmationModelService: ConfirmationModelService,
    private entryDetailModelService: EntryDetailModelService,
    private router: Router,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    if (!this.isCustomer)
      this.modifyTableStructureToDeliveryType();
  }

  ngOnChanges(): void {
    this.refreshEntryData(); // to refersh first time
    this.entryDataAvaliable = this.rawTransactionList.length > 0;

    this.enterDataService.isDataChanged?.subscribe(flag => {
      if (flag) {
        this.entryDataAvaliable = true;
        this.refreshEntryData(); // to refresh when there is data change
        this.newEntry = false;
        this.isRefreshing = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked(): void {
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  modifyTableStructureToDeliveryType() {
    this.tableStructure[1] = {
      key: 'customer',
      label: 'Customer',
      customClass: 'width-limit-200',
      dataType: 'nameText'
    };
    this.tableStructure.splice(4, 1);
  }

  refreshData() {
    if (this.isRefreshing)
      return;
    this.isRefreshing = true;

    setTimeout(() => {
      if (this.entryDataAvaliable) {
        this.refreshEntryData();
        this.notificationService.transactionListRefreshed();
      } else {
        this.enterDataService.hardRefresh();

        this.notificationService.showNotification({
          heading: 'No data found!',
          message: 'Iniciating hard refresh.',
          duration: 4000,
          leftBarColor: this.notificationService.color.yellow
        });
      }
      this.isRefreshing = false;
    }, 1000);
  }

  export(type: string) {
    let forExport;
    if (this.dataSource.data.length > 5) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const endIndex = startIndex + this.paginator.pageSize;
      const displayedRows = this.dataSource.data.slice(startIndex, endIndex);
      forExport = displayedRows;
    } else {
      forExport = this.dataSource.data;
    }

    const formatForExport: InventoryExportEntry[] = forExport.map((item: any) => {
      return {
        Date: item.date,
        'Delivery Person Name': item.deliveryBoy?.fullName,
        // 'Delivery Person Phone': item.deliveryBoy?.phoneNumber,
        'Shipping Address': item.shippingAddress,
        'Sent Quantity': item.sent,
        'Received Quantity': item.recieved,
        'Pending Units': item.pending,
        'Rate/Unit': item.rate,
        'Total Amount': item.totamAmt,
        'Payment Amount': item.paymentAmt,
        'Due Amount': item.dueAmt
      };
    });

    formatForExport.reverse();

    if (type === 'excel')
      this.exportService.exportToExcel(formatForExport, this.customerObject?.data.fullName);
    else if (type === 'pdf')
      this.exportService.exportToPdf(formatForExport, this.customerObject?.data.fullName);
  }

  async refreshEntryData() {
    this.newEntry = false;
    this.pendingUnit = 0;
    this.dueAmount = 0;
    this.rawTransactionList = [];
    this.processedTableData = null;
    this.openTransaction = undefined;

    if (this.isCustomer)
      this.rawTransactionList = this.enterDataService.getCustomerTransactionList(this.customerObject?.data?.userId);
    else
      this.rawTransactionList = this.enterDataService.getDeliveryPersonTransactionList(this.deliveryPersonObject?.data?.userId);
    this.processedTableData = this.rawTransactionList.map((item: EntryTransaction) => this.transformItem(item)).reverse();

    this.dataSource.data = this.processedTableData;
    this.resetPaginator();
  }

  resetPaginator() {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.dataSource.paginator = this.paginator;
    }
  }

  transformItem(item: EntryTransaction) {
    const sent = item.data?.sent || 0;
    const recieved = item.data?.recieved || 0;
    const rate = item.data?.rate || 0;
    const payment = item.data?.payment || 0;

    this.pendingUnit += sent - recieved;
    const totalAmt = sent * rate;
    this.dueAmount += sent * rate - payment;

    return {
      date: dateConverter(item.data?.date || ''),
      customer: {
        fullName: item.data?.customer?.fullName,
        userId: item.data?.customer?.userId
      },
      deliveryBoy: {
        fullName: item.data?.deliveryBoy?.fullName,
        userId: item.data?.deliveryBoy?.userId
      },
      sent: sent,
      recieved: recieved,
      shippingAddress: item.data.shippingAddress,
      pending: this.pendingUnit,
      rate: rate,
      totamAmt: totalAmt,
      paymentAmt: payment,
      dueAmt: this.dueAmount,
      transactionId: item.data?.transactionId
    };
  }

  saveEntry(event: EntryTransaction) {
    this.enterDataService.addNewEntry(event, !!this.openTransaction);
  }

  editEntry(object: any) {
    this.confirmationModelService.showModel({
      heading: 'Edit Entry?',
      message: 'You are trying to edit an existing entry, are you sure?',
      leftButton: {
        text: 'Yes',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY_BLUE,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS?.GREY,
      }
    }).subscribe(result => {
      this.confirmationModelService.hideModel();
      if (result === 'left') {
        this.openTransaction = this.enterDataService.getTransactionList()?.[object?.transactionId];
        this.newEntry = true;
      }
    });
  }

  showMore(object: any) {
    const expandView = this.enterDataService.getTransactionList()?.[object?.transactionId];
    this.entryDetailModelService.showModel(expandView);
  }

  deleteEntry(object: any) {
    if (!object) {
      this.notificationService.somethingWentWrong('101');
      return;
    }
    this.enterDataService.deleteEntry(object);
  }

  openProfile(obj: any) {
    if (obj.userId) {
      if (this.isCustomer)
        this.router.navigate(['/dashboard/delivery'], { queryParams: { userId: obj.userId } });
      else
        this.router.navigate(['/dashboard/customers'], { queryParams: { userId: obj.userId } });
    } else {
      this.notificationService.showNotification({
        heading: 'Profile not setup.',
        message: obj.fullName + "'s profile is not complete!",
        duration: 5000,
        leftBarColor: this.notificationService.color.yellow
      });
    }
  }

  getTemplate(dataType: string) {
    if (dataType === 'amountText') return this.amountText;
    if (dataType === 'nameText') return this.nameText;
    if (dataType === 'actionText') return this.actionText;
    return this.plainText;
  }

  displayedColumns(): string[] {
    return this.tableStructure.map(item => item.key);
  }
}