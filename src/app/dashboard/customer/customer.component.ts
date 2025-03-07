import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { CustomerDataService } from '../../services/customer-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { NewAccountComponent } from "../new-account/new-account.component";
import { UserCardComponent } from "../../common/user-card/user-card.component";
import { SearchService } from '../../services/search.service';
import { UserDetailsComponent } from "../../common/user-details/user-details.component";
import { EntryDataTableComponent } from "../entry-data-table/entry-data-table.component";
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-customer',
  imports: [
    CommonModule,
    NewAccountComponent,
    UserCardComponent,
    UserDetailsComponent,
    EntryDataTableComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent implements OnInit {

  @ViewChild('statArea') statArea!: ElementRef;

  customerData?: any;
  computedData: any = {
    customerList: [],
    lastUpdatedStr: ''
  }
  userId = '';
  selectedCustomer?: any;
  addNewCustomer = false;
  isSearching = false;
  isEditingProfile = false;
  selectedIndex = 0;
  dueAmount = 0;
  customerUserId?: string;
  statistics: any = {
    sentSum: 0,
    recieveSum: 0,
    pending: 0,
    dueAmount: 0
  };
  focusedFormName = '';

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private customerService: CustomerDataService,
    private searchService: SearchService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      this.customerUserId = params['userId'];  // Extracts 'userId' from the URL, if it exists
    });

    this.userId = this.accountService.getUserId();
    if (this.customerService.hasCustomerData()) {
      this.customerData = this.customerService.getCustomerData();

      this.computeCustomerData();
    } else {
      this.refreshCustomerData();
    }

    this.customerService.isDataChanged?.subscribe(flag => {
      if (flag) {
        this.selectedCustomer = null;
        this.customerData = this.customerService.getCustomerData();
        this.computeCustomerData();
      }
    });

    this.searchService.searchText$.subscribe(searchText => {
      if (searchText && searchText.length > 0) {
        this.computedData.customerList = Object.values(this.customerData.customerList).filter((item: any) =>
          Object.values(item.data).toString().toLowerCase().includes(searchText.toLowerCase())
        );
        this.isSearching = true;
        this.selectedCustomer = null;
      } else {
        this.computedData.customerList = Object.values(this.customerService.getCustomerList());
        this.isSearching = false;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (this.statArea && !this.statArea.nativeElement.contains(event.target) &&
      ['sentList', 'recieveList', 'pendingList'].includes(this.focusedFormName))
      this.focusedFormName = '';
  }

  computeCustomerData() {
    this.computedData = {
      customerList: [],
      lastUpdatedStr: ''
    }

    this.computedData.lastUpdatedStr = timeAgoWithMsg(this.customerData.others.lastFrereshed);
    this.computedData.customerList = Object.values(this.customerData.customerList || {});

    this.openProfileOnLoad();
  }

  openProfileOnLoad() {
    if (this.customerUserId) {
      this.selectedCustomer = this.customerData?.customerList?.[this.customerUserId];
      if (this.selectedCustomer) {
        this.selectedIndex = Object.values(this.customerData.customerList).findIndex((obj: any) => obj?.data?.userId === this.customerUserId);
      }
    }
  }

  onDeleteProfile(userId: string) {
    this.customerService.deleteCustoner(userId);
  }

  customerSelected(object: any, index: number) {
    this.addNewCustomer = false;
    this.selectedIndex = index;
    this.selectedCustomer = object;
  }

  onProfileEdit() {
    this.isEditingProfile = true;
    this.addNewCustomer = true;
  }

  onAddNewCustomer() {
    this.addNewCustomer = !this.addNewCustomer;
    if (this.addNewCustomer)
      this.isEditingProfile = false;
    else
      this.selectedCustomer = null;
  }

  async refreshCustomerData(showNotification = false) {
    this.selectedCustomer = null;
    await this.customerService.refreshData(showNotification);
    this.customerData = this.customerService.getCustomerData();
    this.computeCustomerData();
  }

  updateDueAmount(event: number) {
    this.dueAmount = event;
  }

  updateDataSource(event: any) {
    this.dataSource.data = event;

    this.statistics = {
      sentSum: 0,
      recieveSum: 0,
      pending: 0,
      dueAmount: 0
    };

    for (const obj of this.dataSource.data) {
      if (obj.productDetail)
        for (const product of obj.productDetail)
          if (product.productData.productReturnable)
            this.statistics.sentUnits += parseInt(product.sentUnits);
    }

    for (const obj of this.dataSource.data) {
      if (obj.productDetail)
        for (const product of obj.productDetail)
          if (product.productData.productReturnable)
            this.statistics.recievedUnits += parseInt(product.recievedUnits);
    }

    for (const obj of this.dataSource.data) {
      if (obj.productDetail)
        for (const product of obj.productDetail)
          if (product.productData.productReturnable)
            this.statistics.pending += parseInt(product.sentUnits) - parseInt(product.recievedUnits);
    }
  }

  getDetailedStat(focus: string, type: string) {
    this.focusedFormName = focus;

    const object: any = {};
    if (type === 'sentSum') {
      for (const obj of this.dataSource.data) {
        if (obj.productDetail) {
          for (const product of obj.productDetail) {
            const sent = parseInt(product.sentUnits);

            if (object?.[product.productData.productId]) {
              object[product.productData.productId].value += sent;
            } else {
              object[product.productData.productId] = {
                name: product.productData.name,
                customClass: product.productData.productReturnable ? '' : 'secondary-color',
                value: sent
              }
            }
          }
        }
      }
      this.statistics.sentList = Object.values(object);
    } else if (type === 'recieveSum') {
      for (const obj of this.dataSource.data) {
        if (obj.productDetail)
          for (const product of obj.productDetail)
            if (product.productData.productReturnable) {
              const receive = parseInt(product.recievedUnits);

              if (object?.[product.productData.productId]) {
                object[product.productData.productId].value += receive;
              } else {
                object[product.productData.productId] = {
                  name: product.productData.name,
                  customClass: product.productData.productReturnable ? '' : 'secondary-color',
                  value: receive
                }
              }
            }
      }
      this.statistics.recieveList = Object.values(object);
    } else if (type === 'pending') {
      for (const obj of this.dataSource.data) {
        if (obj.productDetail)
          for (const product of obj.productDetail)
            if (product.productData.productReturnable) {
              const pending = parseInt(product.sentUnits) - parseInt(product.recievedUnits);

              if (object?.[product.productData.productId]) {
                object[product.productData.productId].value += pending;
              } else {
                object[product.productData.productId] = {
                  name: product.productData.name,
                  customClass: product.productData.productReturnable ? '' : 'secondary-color',
                  value: pending
                }
              }
            }
      }
      this.statistics.pendingList = Object.values(object);
    }
  }
}
