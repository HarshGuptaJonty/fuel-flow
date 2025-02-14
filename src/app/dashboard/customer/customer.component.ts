import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { CustomerDataService } from '../../services/customer-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { NewAccountComponent } from "../new-account/new-account.component";
import { UserCardComponent } from "../../common/user-card/user-card.component";
import { SearchService } from '../../services/search.service';
import { UserDetailsComponent } from "../../common/user-details/user-details.component";
import { NotificationService } from '../../services/notification.service';
import { DataTableComponent } from "../../common/data-table/data-table.component";

@Component({
  selector: 'app-customer',
  imports: [
    CommonModule,
    NewAccountComponent,
    UserCardComponent,
    UserDetailsComponent,
    DataTableComponent
  ],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.scss'
})
export class CustomerComponent {

  customerData?: any;
  computedData: any = {
    customerList: [],
    lastUpdatedStr: ''
  }
  userId: string = '';
  selectedCustomer?: any;
  addNewCustomer: boolean = false;
  isSearching: boolean = false;
  isEditingProfile: boolean = false;
  selectedIndex: number = 0;

  constructor(
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private customerService: CustomerDataService,
    private searchService: SearchService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userId = this.accountService.getUserId();
    if (this.customerService.hasCustomerData()) {
      this.customerData = this.customerService.getCustomerData();

      this.computeCustomerData();
    } else {
      this.refreshCustomerData();
    }

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

    // this.selectedCustomer = this.computedData.customerList[0]; // TODO: remove this line after developing customer-details page
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

  async refreshCustomerData(showNotification: boolean = false) {
    this.selectedCustomer = null;
    const latestData = await this.firebaseService.getData('customer/bucket'); // todo increase database efficiency
    let data = {
      customerList: latestData,
      others: {
        lastFrereshed: Date.now()
      }
    }
    this.customerService.setCustomerData(data);
    this.customerData = data;

    this.computeCustomerData();

    if (Object.keys(latestData).length === 0)
      this.notificationService.showNotification({
        heading: 'No customer data!',
        message: 'Please add a customer.',
        duration: 5000,
        leftBarColor: this.notificationService.color.red
      });
    else if (showNotification)
      this.notificationService.showNotification({
        heading: 'Customer data refreshed.',
        duration: 5000,
        leftBarColor: this.notificationService.color.green
      });
  }
}
