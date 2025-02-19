import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { AdminDataService } from '../services/admin-data.service';
import { formatDateAndTime, getNumberInformat } from '../shared/commonFunctions';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  userData: any;
  adminProfileData?: any;
  profilePicLink: string | undefined = ''; //'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJxo2NFiYcR35GzCk5T3nxA7rGlSsXvIfJwg&s'

  constructor(
    private accountService: AccountService,
    private adminDataService: AdminDataService,
  ) { }

  ngOnInit(): void {
    if (this.accountService.hasUserData()) {
      this.userData = this.accountService.getUserData();
    } else {
      const data = this.adminDataService.getAdminData(this.accountService.getUserId());
      this.accountService.setUserData(data);
      this.userData = data;
    }
    this.adminProfileData = this.userData?.data;

    const authData = this.accountService.getAuthData();
    this.adminProfileData.importantTimes.createdAt = parseInt(authData?.user?.createdAt || '' + Date.now());
    this.adminProfileData.importantTimes.lastSeen = parseInt(authData?.user?.lastLoginAt || '' + Date.now());
  }

  getNumberInformat(arg0: any) {
    return getNumberInformat(arg0);
  }

  formatDateAndTime(arg0: number) {
    return formatDateAndTime(arg0);
  }
}
