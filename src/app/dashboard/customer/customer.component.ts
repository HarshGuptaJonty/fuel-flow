import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { CustomerDataService } from '../../services/customer-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { NewAccountComponent } from "../new-account/new-account.component";
import { UserCardComponent } from "../../common/user-card/user-card.component";
import { SearchService } from '../../services/search.service';
import { UserDetailsComponent } from "../../common/user-details/user-details.component";
import { EntryDataTableComponent } from "../entry-data-table/entry-data-table.component";
import { ActivatedRoute } from '@angular/router';

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
  customerUserId?: string;

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
}
