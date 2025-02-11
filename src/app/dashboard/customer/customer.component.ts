import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { CustomerDataServiceService } from '../../services/customer-data-service.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { NewCustomerComponent } from "../new-customer/new-customer.component";

@Component({
  selector: 'app-customer',
  imports: [
    CommonModule,
    NewCustomerComponent
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

  constructor(
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private customerService: CustomerDataServiceService
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
  }

  computeCustomerData() {
    this.computedData = {
      customerList: [],
      lastUpdatedStr: ''
    }

    this.computedData.lastUpdatedStr = timeAgoWithMsg(this.customerData.others.lastFrereshed);
    this.computedData.customerList = Object.values(this.customerData.customerList);
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
