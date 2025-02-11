import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { FirebaseService } from '../services/firebase.service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { CustomerDataService } from '../services/customer-data.service';
import { SearchService } from '../services/search.service';

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

  constructor(
    private accountService: AccountService,
    private firebaseService: FirebaseService,
    private customerService: CustomerDataService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.firstChild?.url.subscribe((url) => {
      this.activeNavMenu = url[0]?.path;
    });

    this.onResize();

    if (this.accountService.hasUserData()) {
      this.userData = this.accountService.getUserData();
      this.userData.from = 'LOCAL_STORAGE';
    } else {
      let data = await this.firebaseService.getData(`admint/${this.accountService.getUserId()}`);
      this.accountService.setUserData(data);
      this.userData = data;
      this.userData.from = 'REMOTE_STORAGE';
    }
    this.adminProfileData = this.userData?.data;

    if (this.userData)
      this.computeUserData();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    this.visibleInMenuItem('setting', this.screenWidth <= 750 ? 'side' : 'top');
    this.visibleInMenuItem('inventory', this.screenWidth <= 650 ? 'side' : 'top');
    this.visibleInMenuItem('customers', this.screenWidth <= 550 ? 'side' : 'top');
  }

  computeUserData() {
    this.profilePicLink = this.adminProfileData?.profilePicLink;
  }

  navMenuItemClicked(key: string) {
    this.activeNavMenu = key;
    this.showMenuCardInfo = false;
    if (key === 'log-out') {
      //TODO: logout confirmation model popup
      this.accountService.signOut();
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
    return Object.keys(this.customerService.getCustomerData()?.customerList).length > 0;
  }
}
