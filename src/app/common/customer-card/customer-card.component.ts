import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { copyData, getNumberInformat } from '../../shared/commonFunctions';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-customer-card',
  imports: [
    CommonModule
  ],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})
export class CustomerCardComponent implements OnInit {

  constructor(
    private notificationService: NotificationService
  ) { }

  @Input() customerObject: any;
  @Input() selected: boolean = false;

  data: any;
  others: any;

  ngOnInit(): void {
    this.data = this.customerObject?.data;
    this.others = this.customerObject?.others;
  }

  copyData(event: any, data: string) {
    event.stopPropagation();
    copyData(data, this.notificationService);
  }

  getNumberInformat(arg0: any) {
    return getNumberInformat(arg0);
  }
}
