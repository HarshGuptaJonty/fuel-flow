import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { FirebaseService } from '../../services/firebase.service';
import { NotificationService } from '../../services/notification.service';
import { SearchService } from '../../services/search.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { UserCardComponent } from '../../common/user-card/user-card.component';
import { CustomerDetailsComponent } from "../../common/customer-details/customer-details.component";

@Component({
  selector: 'app-delivery-person',
  imports: [
    CommonModule,
    UserCardComponent,
    CustomerDetailsComponent
  ],
  templateUrl: './delivery-person.component.html',
  styleUrl: './delivery-person.component.scss'
})
export class DeliveryPersonComponent implements OnInit {

  deliveryPersonUserId?: string;
  deliveryPersonData?: any;
  computedData: any = {
    deliveryPersonList: [],
    lastUpdatedStr: ''
  }
  userId: string = '';
  selectedDeliveryPerson?: any;
  isSearching: boolean = false;
  selectedIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private deliveryPersonDataService: DeliveryPersonDataService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    console.log('yes');
    this.route.queryParams.subscribe(params => {
      this.deliveryPersonUserId = params['userId'];  // Extracts 'userId' from the URL, if it exists
    });

    this.userId = this.accountService.getUserId();
    if (this.deliveryPersonDataService.hasDeliveryPersonData()) {
      this.deliveryPersonData = this.deliveryPersonDataService.getDeliveryPersonData();

      this.computeDeliveryPersonData();
    } else {
      this.refreshDeliveryPersonData();
    }
    console.log('yes2');
  }

  computeDeliveryPersonData() {
    this.computedData = {
      deliveryPersonList: [],
      lastUpdatedStr: ''
    }

    this.computedData.lastUpdatedStr = timeAgoWithMsg(this.deliveryPersonData.others.lastFrereshed);
    this.computedData.deliveryPersonList = Object.values(this.deliveryPersonData.deliveryPersonList || {});
  }

  openProfileOnLoad() {
    if (this.deliveryPersonUserId) {
      this.selectedDeliveryPerson = this.deliveryPersonData?.[this.deliveryPersonUserId];
      if (this.selectedDeliveryPerson) {
        this.selectedIndex = Object.values(this.deliveryPersonData.deliveryPersonList).findIndex((obj: any) => obj?.data?.userId === this.deliveryPersonUserId);
      }
    }
  }

  userSelected(object: any, index: number) {
    this.selectedIndex = index;
    this.selectedDeliveryPerson = object;
  }

  async refreshDeliveryPersonData(showNotification: boolean = false) {
    this.selectedDeliveryPerson = null;
    const latestData = await this.firebaseService.getData('deliveryPerson/bucket'); // todo increase database efficiency
    let data = {
      customerList: latestData,
      others: {
        lastFrereshed: Date.now()
      }
    }
    this.deliveryPersonDataService.setDeliveryPersonData(data);
    this.deliveryPersonData = data;

    this.computeDeliveryPersonData();
    this.openProfileOnLoad();

    if (Object.keys(latestData).length === 0)
      this.notificationService.showNotification({
        heading: 'No delivery person data!',
        duration: 5000,
        leftBarColor: this.notificationService.color.red
      });
    else if (showNotification)
      this.notificationService.showNotification({
        heading: 'Delivery person data refreshed.',
        duration: 5000,
        leftBarColor: this.notificationService.color.green
      });
  }
}
