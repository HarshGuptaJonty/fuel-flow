import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { FormControl, FormGroup } from '@angular/forms';
import { Customer } from '../../../assets/models/Customer';

@Component({
  selector: 'app-inventory',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    NewFullEntryComponent,
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
  @ViewChild('productDetail', { static: true }) productDetail!: TemplateRef<any>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('customerName') customerName!: ElementRef;
  @ViewChild('filterArea') filterArea!: ElementRef;

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
      key: 'shippingAddress',
      label: 'Address',
      customClass: 'witdh-limit-200',
      dataType: 'plainText'
    }, {
      key: 'deliveryBoy',
      label: 'Delivery',
      customClass: 'witdh-limit-200',
      dataType: 'dnameText'
    }, {
      key: 'productData.name',
      label: 'Product',
      customClass: 'text-right',
      dataType: 'productDetail',
      isLink: true
    }, {
      key: 'sentUnits',
      label: 'Sent',
      customClass: 'text-right',
      dataType: 'productDetail'
    }, {
      key: 'recievedUnits',
      label: 'Recieved',
      customClass: 'text-right',
      dataType: 'productDetail'
    }, {
      key: 'productData.pending',
      label: 'Pending',
      customClass: 'text-right',
      dataType: 'productDetail'
    }, {
      key: 'productData.rate',
      label: 'Rate/Unit',
      customClass: 'text-right',
      dataType: 'productDetail',
      isAmount: true
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

  newEntry = false;
  isRefreshing = false;
  isSearching = false;
  processedTableData?: any;
  unchangedProcessedData?: any;
  rawTransactionList: EntryTransaction[] = [];
  entryDataAvaliable = false;
  openTransaction?: EntryTransaction;
  filterActive = false;
  focusedFormName = '';

  customerList: Customer[] = [];
  customerSearchList: Customer[] = [];
  customerFilterId = '';

  shippingAddressList: string[] = [];
  shippingAddressSelectedList: string[] = [];
  shippingAddressSubmitted: string[] = [];

  dataSource = new MatTableDataSource<any>([]);

  filterForm: FormGroup = new FormGroup({
    customerName: new FormControl('')
  });

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

    if (this.customerDataService.getCustomerData()) {
      this.customerList = Object.values(this.customerDataService.getCustomerList());
      this.customerSearchList = this.customerList;
    }
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (this.filterArea && !this.filterArea.nativeElement.contains(event.target)) {
      this.onfocus('');
    }
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

    if (type === 'excel')
      this.exportService.exportToExcel(forExport);
    else if (type === 'pdf')
      this.exportService.exportToPdf(forExport);
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
    this.rawTransactionList = [];
    this.processedTableData = null;
    this.openTransaction = undefined;

    this.rawTransactionList = this.enterDataService.getSortedTransactionList();
    this.unchangedProcessedData = this.rawTransactionList.map((item: EntryTransaction) => this.transformItem(item)).reverse();
    this.processedTableData = this.unchangedProcessedData;

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
    const payment = item.data?.payment || 0;
    const totalAmt = item.data.total || 0;

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
      totamAmt: totalAmt,
      paymentAmt: payment,
      dueAmt: totalAmt - payment,
      transactionId: item.data?.transactionId,
      shippingAddress: item.data.shippingAddress,
      productDetail: item.data.selectedProducts
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
      item.extraDetails,
      item.shippingAddress
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

  openProduct(product: any) {
    this.router.navigate(['/dashboard/warehouse'], { queryParams: { productId: product.productData.productId } });
  }

  searchCustomer() {
    const value = this.customerName.nativeElement.value;

    if (value?.length == 0) {
      this.customerSearchList = this.customerList;
      this.customerFilterId = '';
      this.shippingAddressList = [];
      this.processedTableData = this.unchangedProcessedData
      this.dataSource.data = this.processedTableData;
    } else
      this.customerSearchList = this.customerList.filter((item) =>
        Object.values(item.data || {}).toString()?.toLowerCase()?.includes(value?.toLowerCase())
      );
  }

  onSelectCustomer(customer: Customer) {
    this.customerFilterId = customer.data.userId;
    this.customerName.nativeElement.value = customer.data.fullName + ' (' + this.formatNumber(customer.data.phoneNumber) + ')';
    this.customerSearchList = [];

    this.shippingAddressSelectedList = [];
    this.shippingAddressSubmitted = [];
    this.shippingAddressList = customer.data.shippingAddress || [];

    this.filterList();
  }

  submitAddressFilters() {
    this.focusedFormName = '';
    this.shippingAddressSubmitted = [...this.shippingAddressSelectedList];
    this.filterList();
  }

  toggleSelectAddress(address: string) {
    const index = this.shippingAddressSelectedList.indexOf(address);
    if (index !== -1) {
      this.shippingAddressSelectedList.splice(index, 1);
    } else {
      this.shippingAddressSelectedList.push(address);
    }
  }

  removeAddress(event: any, index: number) {
    event.stopPropagation();
    this.shippingAddressSelectedList.splice(index, 1)
    this.shippingAddressSubmitted = [...this.shippingAddressSelectedList];

    this.filterList();
  }

  filterList() {
    let filterList = this.unchangedProcessedData

    if (this.customerFilterId.length > 0)
      filterList = filterList.filter((item: any) => item.customer.userId === this.customerFilterId);

    if (this.shippingAddressSubmitted.length > 0)
      filterList = filterList.filter((item: any) => this.shippingAddressSubmitted.includes(item.shippingAddress));

    this.processedTableData = filterList
    this.dataSource.data = this.processedTableData;
  }

  closeFilter() {
    this.filterActive = false;
    this.processedTableData = this.unchangedProcessedData
    this.dataSource.data = this.processedTableData;
    this.shippingAddressList = [];
  }

  getStat(type: string): number {
    let result = 0;
    if (type === 'sentSum') {
      for (let obj of this.dataSource.data) {
        if (obj.productDetail)
          for (let product of obj.productDetail)
            if (product.productData.productReturnable)
              result += parseInt(product.sentUnits);
      }
    } else if (type === 'recieveSum') {
      for (let obj of this.dataSource.data) {
        if (obj.productDetail)
          for (let product of obj.productDetail)
            if (product.productData.productReturnable)
              result += parseInt(product.recievedUnits);
      }
    } else if (type === 'pending') {
      for (let obj of this.dataSource.data) {
        if (obj.productDetail)
          for (let product of obj.productDetail)
            if (product.productData.productReturnable)
              result += parseInt(product.sentUnits) - parseInt(product.recievedUnits);
      }
    } else if (type === 'dueAmt') {
      for (let obj of this.dataSource.data)
        result += parseInt(obj.dueAmt);
    }
    return result || 0;
  }

  getTemplate(dataType: string) {
    if (dataType === 'amountText') return this.amountText;
    if (dataType === 'cnameText') return this.cnameText;
    if (dataType === 'dnameText') return this.dnameText;
    if (dataType === 'actionText') return this.actionText;
    if (dataType === 'productDetail') return this.productDetail;
    return this.plainText;
  }

  displayedColumns(): string[] {
    return this.tableStructure.map(item => item.key);
  }

  formatNumber(value?: string) {
    if (!value)
      return '';
    return value.replace(/(\d{5})(\d{5})/, '$1 $2');
  }

  onfocus(formName: string) {
    this.focusedFormName = formName;
  }

  getValue(obj: any, path: string): any {
    const returnable = obj?.productData?.productReturnable || false;

    if (path === 'productData.pending')
      if (returnable)
        return obj.sentUnits - obj.recievedUnits;
      else
        return '-';

    if (path === 'recievedUnits')
      if (returnable)
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
      else
        return '-';

    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }
}
