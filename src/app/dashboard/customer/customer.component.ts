import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { CustomerDataService } from '../../services/customer-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { NewCustomerComponent } from "../new-customer/new-customer.component";
import { CustomerCardComponent } from "../../common/customer-card/customer-card.component";
import { SearchService } from '../../services/search.service';
import { CustomerDetailsComponent } from "../../common/customer-details/customer-details.component";

@Component({
  selector: 'app-customer',
  imports: [
    CommonModule,
    NewCustomerComponent,
    CustomerCardComponent,
    CustomerDetailsComponent
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
    private searchService: SearchService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userId = this.accountService.getUserId();
    if (this.customerService.hasCustomerData()) {
      this.customerData = this.customerService.getCustomerData();
      this.customerData.from = 'LOCAL_STORAGE';

      this.computeCustomerData();
    } else {
      this.refreshCustomerData();
    }

    this.searchService.searchText$.subscribe(searchText => {
      if (searchText && searchText.length > 0) {
        this.computedData.customerList = Object.values(this.customerData.customerList).filter((item: any) =>
          String(item.data?.fullName).toLowerCase().includes(searchText.toLowerCase()) ||
          String(item.data?.phoneNumber).includes(searchText)
        );
        this.isSearching = true;
        this.selectedCustomer = null;
      } else {
        this.computedData.customerList = Object.values(this.customerData.customerList);
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
    this.computedData.customerList = Object.values(this.customerData.customerList);

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
  }

  async refreshCustomerData() {
    let data = {
      customerList: await this.firebaseService.getData('customer/bucket'),
      others: {
        lastFrereshed: Date.now()
      }
    }
    this.customerService.setCustomerData(data);
    this.customerData = data;
    this.customerData.others.from = 'REMOTE_STORAGE';

    this.computeCustomerData();
  }
}
