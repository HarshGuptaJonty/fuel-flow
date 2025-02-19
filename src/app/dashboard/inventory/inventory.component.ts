import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { EntryDataService } from '../../services/entry-data.service';
import { NotificationService } from '../../services/notification.service';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { Router } from '@angular/router';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { dateConverter } from '../../shared/commonFunctions';
import { NewFullEntryComponent } from "./new-full-entry/new-full-entry.component";
import { CustomerDataService } from '../../services/customer-data.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { ExportService } from '../../services/export.service';
import { InventoryExportEntry } from '../../../assets/models/ExportEntry';

@Component({
  selector: 'app-inventory',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    NewFullEntryComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit, AfterViewChecked {

  @ViewChild('plainText', { static: true }) plainText!: TemplateRef<any>;
  @ViewChild('amountText', { static: true }) amountText!: TemplateRef<any>;
  @ViewChild('cnameText', { static: true }) cnameText!: TemplateRef<any>;
  @ViewChild('dnameText', { static: true }) dnameText!: TemplateRef<any>;
  @ViewChild('actionText', { static: true }) actionText!: TemplateRef<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  tableStructure = [
    {
      key: 'date',
      label: 'Date',
      dataType: 'plainText'
    }, {
      key: 'customer',
      label: 'Customer',
      customClass: 'witdh-limit-200',
      dataType: 'cnameText'
    }, {
      key: 'deliveryBoy',
      label: 'Delivery',
      customClass: 'witdh-limit-200',
      dataType: 'dnameText'
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
  newEntry = false;
  isRefreshing = false;
  isSearching = false;
  processedTableData?: any;
  rawTransactionList: EntryTransaction[] = [];
  entryDataAvaliable = false;
  openTransaction?: EntryTransaction;

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private afAuth: AngularFireAuth,
    private enterDataService: EntryDataService,
    private notificationService: NotificationService,
    private confirmationModelService: ConfirmationModelService,
    private entryDetailModelService: EntryDetailModelService,
    private router: Router,
    private customerDataService: CustomerDataService,
    private deliveryPersonDataService: DeliveryPersonDataService,
    private exportService: ExportService
  ) { }

  ngOnInit(): void {
    this.refreshEntryData(); // to refersh first time
    this.entryDataAvaliable = this.rawTransactionList?.length > 0;

    this.enterDataService.isDataChanged.subscribe(flag => {
      if (flag) {
        this.entryDataAvaliable = true;
        this.refreshEntryData(); // to refresh when there is data change
        this.newEntry = false;
        this.isRefreshing = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.paginator && this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  export(type: string) {
    let forExport;
    if (this.dataSource.data.length > 10) {
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
        'Customer Name': item.customer?.fullName,
        // 'Customer Phone': item.customer?.phoneNumber,
        'Delivery Person Name': item.deliveryBoy?.fullName,
        // 'Delivery Person Phone': item.deliveryBoy?.phoneNumber,
        'Sent Quantity': item.sent,
        'Received Quantity': item.recieved,
        'Pending Units': item.pending,
        'Rate/Unit': item.rate,
        'Total Amount': item.totamAmt,
        'Payment Amount': item.paymentAmt,
        'Due Amount': item.dueAmt
      };
    });

    if (type === 'excel')
      this.exportService.exportToExcel(formatForExport);
    else if (type === 'pdf')
      this.exportService.exportToPdf(formatForExport);
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

  async refreshEntryData() {
    this.newEntry = false;
    this.pendingUnit = 0;
    this.dueAmount = 0;
    this.rawTransactionList = [];
    this.processedTableData = null;
    this.openTransaction = undefined;

    this.rawTransactionList = this.enterDataService.getSortedTransactionList();
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
    this.dueAmount += totalAmt - payment;

    return {
      date: dateConverter(item.data?.date || ''),
      customer: {
        fullName: item.data?.customer?.fullName,
        phoneNumber: item.data?.customer?.phoneNumber,
        userId: item.data?.customer?.userId
      },
      deliveryBoy: {
        fullName: item.data?.deliveryBoy?.fullName,
        phoneNumber: item.data?.deliveryBoy?.phoneNumber,
        userId: item.data?.deliveryBoy?.userId
      },
      sent: sent > 0 ? sent : '',
      recieved: recieved > 0 ? recieved : '',
      pending: sent - recieved > 0 ? sent - recieved : '',
      rate: rate > 0 ? rate : '',
      totamAmt: totalAmt > 0 ? totalAmt : '',
      paymentAmt: payment > 0 ? payment : '',
      dueAmt: totalAmt - payment > 0 ? totalAmt - payment : '',
      transactionId: item.data?.transactionId
    };
  }

  forSearch(item: any) {
    return [
      item.date,
      item.customer?.fullName,
      item.customer?.phoneNumber,
      this.customerDataService.getAddress(item.customer?.userId),
      item.deliveryBoy?.fullName,
      item.deliveryBoy?.phoneNumber,
      this.deliveryPersonDataService.getAddress(item.deliveryBoy?.userId),
      item.extraDetails
    ]
  }

  onSearch(event: any) {
    const searchValue = (event.target as HTMLInputElement).value;
    if (searchValue && searchValue.length > 0) {
      this.dataSource.data = this.processedTableData.filter((item: any) => this.forSearch(item).toString().toLowerCase().includes(searchValue.toLowerCase()));
      this.isSearching = true;
    } else {
      this.dataSource.data = this.processedTableData;
      this.isSearching = false;
    }
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
      if (result === 'left') {
        this.confirmationModelService.hideModel();
        this.openTransaction = this.enterDataService.getTransactionList()?.[object?.transactionId];
        this.newEntry = true;
      } else
        this.confirmationModelService.hideModel();
    });
  }

  deleteEntry(object: any) {
    if (!object) {
      this.notificationService.somethingWentWrong('109');
      return;
    }
    this.enterDataService.deleteEntry(object);
  }

  showMore(object: any) {
    const expandView = this.enterDataService.getTransactionList()?.[object?.transactionId];
    this.entryDetailModelService.showModel(expandView);
  }

  openCustomerProfile(obj: any) {
    if (obj.userId) {
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

  openDeliveryBoyProfile(obj: any) {
    if (obj.userId) {
      this.router.navigate(['/dashboard/delivery'], { queryParams: { userId: obj.userId } });
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
    if (dataType === 'cnameText') return this.cnameText;
    if (dataType === 'dnameText') return this.dnameText;
    if (dataType === 'actionText') return this.actionText;
    return this.plainText;
  }

  displayedColumns(): string[] {
    return this.tableStructure.map(item => item.key);
  }
}
