import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CustomerDataService } from '../services/customer-data.service';
import { SearchService } from '../services/search.service';
import { NotificationService } from '../services/notification.service';
import { ConfirmationModelService } from '../services/confirmation-model.service';
import { filter, Subscription } from 'rxjs';
import { AdminDataService } from '../services/admin-data.service';
import { DeliveryPersonDataService } from '../services/delivery-person-data.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  menuItemList = [
    {
      title: 'Customers',
      key: 'customers',
      visibleIn: 'top',
      visible: true,
      enable: true
    }, {
      title: 'Delivery',
      key: 'delivery',
      visibleIn: 'top',
      visible: true,
      enable: true
    }, {
      title: 'Inventory',
      key: 'inventory',
      visibleIn: 'top',
      visible: true,
      enable: true
    }, {
      title: 'Profile',
      key: 'profile',
      visibleIn: 'side',
      visible: true,
      enable: true
    }, {
      title: 'Setting',
      key: 'setting',
      visibleIn: 'top',
      visible: true,
      enable: true
    }, {
      title: 'Log Out',
      key: 'log-out',
      visibleIn: 'side',
      visible: true,
      enable: true
    }
  ]

  activeNavMenu: string = 'customers';
  profilePicLink: string | undefined = ''; //https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJxo2NFiYcR35GzCk5T3nxA7rGlSsXvIfJwg&s
  showMenuCardInfo: boolean = false;
  screenWidth: number = 0;
  userData?: any;
  adminProfileData?: any;
  private routeSub: Subscription = new Subscription();

  constructor(
    private accountService: AccountService,
    private customerService: CustomerDataService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private notificationService: NotificationService,
    private confirmationModelService: ConfirmationModelService,
    private adminDataService: AdminDataService,
    private deliveryPersonDataService: DeliveryPersonDataService
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.firstChild?.url.subscribe((url) => this.activeNavMenu = url[0]?.path);
    this.routeSub.add(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
        const child = this.route.firstChild;
        if (child) {
          child.url.subscribe((url) => {
            this.activeNavMenu = url[0]?.path;
          });
        }
      })
    );

    this.onResize();

    if (this.accountService.hasUserData()) {
      this.userData = this.accountService.getUserData();
    } else {
      // fetch admin data from account service
      let data = this.adminDataService.getAdminData(this.accountService.getUserId());
      // let data = await this.firebaseService.getData(`admint/${this.accountService.getUserId()}`);
      this.accountService.setUserData(data);
      this.userData = data;
    }
    this.adminProfileData = this.userData?.data;

    if (this.userData?.data?.userID)
      this.computeUserData();
    else {
      this.accountService.signOut();
      this.notificationService.notAuthorized();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    this.visibleInMenuItem('setting', this.screenWidth <= 870 ? 'side' : 'top');
    this.visibleInMenuItem('inventory', this.screenWidth <= 750 ? 'side' : 'top');
    this.visibleInMenuItem('delivery', this.screenWidth <= 650 ? 'side' : 'top');
    this.visibleInMenuItem('customers', this.screenWidth <= 550 ? 'side' : 'top');
  }

  computeUserData() {
    this.profilePicLink = this.adminProfileData?.profilePicLink;
  }

  navMenuItemClicked(key: string) {
    this.activeNavMenu = key;
    this.showMenuCardInfo = false;
    if (key === 'log-out') {
      this.confirmationModelService.showModel({
        heading: 'Log out?',
        message: 'You are trying to logout, are you sure?',
        leftButton: {
          text: 'Logout',
          customClass: this.confirmationModelService.CUSTOM_CLASS.GREY_RED,
        }, rightButton: {
          text: 'Cancel',
          customClass: this.confirmationModelService.CUSTOM_CLASS.GREY,
        }
      }).subscribe(result => {
        if (result === 'left') {
          this.confirmationModelService.hideModel();
          this.accountService.signOut();
          this.notificationService.loggedOut();
        } else
          this.confirmationModelService.hideModel();
      });
    } else if (key === 'profile') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/dashboard/' + key]);
    }
  }

  onSearch(event: any) {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchService.updateSearchText(searchValue);
  }

  enableMenuItem(key: string, isEnable: boolean) {
    this.menuItemList = this.menuItemList.map(item => item.key === key ? { ...item, enable: isEnable } : item);
  }

  visibleInMenuItem(key: string, isVisibleIn: string) {
    this.menuItemList = this.menuItemList.map(item => item.key === key ? { ...item, visibleIn: isVisibleIn } : item);
  }

  visibleMenuItem(key: string, isVisible: boolean) {
    this.menuItemList = this.menuItemList.map(item => item.key === key ? { ...item, visible: isVisible } : item);
  }

  hasCustomerData() {
    return Object.keys(this.customerService.getCustomerList()).length > 0;
  }

  hasDeliveryPersonData() {
    return Object.keys(this.deliveryPersonDataService.getDeliveryPersonList()).length > 0;
  }
}
