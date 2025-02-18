import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { DeliveryPersonDataService } from '../../services/delivery-person-data.service';
import { timeAgoWithMsg } from '../../shared/commonFunctions';
import { UserCardComponent } from '../../common/user-card/user-card.component';
import { UserDetailsComponent } from "../../common/user-details/user-details.component";
import { NewAccountComponent } from "../new-account/new-account.component";
import { SearchService } from '../../services/search.service';
import { EntryDataTableComponent } from "../entry-data-table/entry-data-table.component";
import { DeliveryPerson } from '../../../assets/models/DeliveryPerson';

@Component({
  selector: 'app-delivery-person',
  imports: [
    CommonModule,
    UserCardComponent,
    UserDetailsComponent,
    NewAccountComponent,
    EntryDataTableComponent
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
  selectedDeliveryPerson?: DeliveryPerson;
  addNewDeliveryBoy: boolean = false;
  isSearching: boolean = false;
  isEditingProfile: boolean = false;
  selectedIndex: number = 0;

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private deliveryPersonDataService: DeliveryPersonDataService,
    private searchService: SearchService
  ) { }

  ngOnInit(): void {
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

    this.deliveryPersonDataService.isDataChanged.subscribe((isChanged) => {
      if (isChanged) {
        this.selectedDeliveryPerson = undefined;
        this.deliveryPersonData = this.deliveryPersonDataService.getDeliveryPersonData();
        this.computeDeliveryPersonData();
      }
    });

    this.searchService.searchText$.subscribe(searchText => {
      if (searchText && searchText.length > 0) {
        this.computedData.customerList = Object.values(this.deliveryPersonData.deliveryPersonList).filter((item: any) =>
          Object.values(item.data).toString().toLowerCase().includes(searchText.toLowerCase())
        );
        this.isSearching = true;
        this.selectedDeliveryPerson = undefined;
      } else {
        this.computedData.customerList = Object.values(this.deliveryPersonDataService.getDeliveryPersonList());
        this.isSearching = false;
      }
    });
  }

  computeDeliveryPersonData() {
    this.computedData = {
      deliveryPersonList: [],
      lastUpdatedStr: ''
    }

    this.computedData.lastUpdatedStr = timeAgoWithMsg(this.deliveryPersonData.others.lastFrereshed);
    this.computedData.deliveryPersonList = Object.values(this.deliveryPersonData.deliveryPersonList || {});

    this.openProfileOnLoad();
  }

  openProfileOnLoad() {
    if (this.deliveryPersonUserId) {
      this.selectedDeliveryPerson = this.deliveryPersonData?.deliveryPersonList?.[this.deliveryPersonUserId];
      if (this.selectedDeliveryPerson) {
        this.selectedIndex = Object.values(this.deliveryPersonData.deliveryPersonList).findIndex((obj: any) => obj?.data?.userId === this.deliveryPersonUserId);
      }
    }
  }

  onDeleteProfile(userId: string) {
    this.deliveryPersonDataService.deleteDeliveryPerson(userId);
  }

  userSelected(object: any, index: number) {
    this.addNewDeliveryBoy = false;
    this.selectedIndex = index;
    this.selectedDeliveryPerson = object;
  }

  onProfileEdit() {
    this.isEditingProfile = true;
    this.addNewDeliveryBoy = true;
  }

  onAddNewDeliveryBoy() {
    this.addNewDeliveryBoy = !this.addNewDeliveryBoy;
    if (this.addNewDeliveryBoy)
      this.isEditingProfile = false;
    else
      this.selectedDeliveryPerson = undefined;
  }

  async refreshDeliveryPersonData(showNotification: boolean = false) {
    this.selectedDeliveryPerson = undefined;
    await this.deliveryPersonDataService.refreshData(showNotification);
    this.deliveryPersonData = this.deliveryPersonDataService.getDeliveryPersonData();
    this.computeDeliveryPersonData();
  }
}
