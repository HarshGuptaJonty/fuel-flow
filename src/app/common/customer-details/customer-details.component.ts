import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { CommonModule } from '@angular/common';
import { copyData, getNumberInformat, timeAgoWithMsg } from '../../shared/commonFunctions';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-customer-details',
  imports: [
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnChanges {

  constructor(
    private notificationService: NotificationService
  ) { }

  @Input() customerObject?: Customer;
  @Input() userId: any;

  @Output() onProfileEdit = new EventEmitter<any>();

  data: any;
  others: any;
  computedData: any = {
    createdOn: 0
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.data = this.customerObject?.data;
    this.others = this.customerObject?.others;

    this.computedData.createdOn = timeAgoWithMsg(this.others?.createdTime)
  }

  getNumberInformat(arg0: any) {
    return getNumberInformat(arg0);
  }

  copyData(data: string) {
    copyData(data, this.notificationService);
  }

  editProfile() {
    this.onProfileEdit.emit();
  }
}
