import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { copyData, getNumberInformat } from '../../shared/commonFunctions';

@Component({
  selector: 'app-customer-card',
  imports: [
    CommonModule
  ],
  templateUrl: './customer-card.component.html',
  styleUrl: './customer-card.component.scss'
})
export class CustomerCardComponent implements OnInit {

  @Input() customerObject: any;
  @Input() selected: boolean = false;

  data: any;
  others: any;

  ngOnInit(): void {
    this.data = this.customerObject?.data;
    this.others = this.customerObject?.others;
  }

  copyData(data: string) {
    copyData(data);
  }

  getNumberInformat(arg0: any) {
    return getNumberInformat(arg0);
  }
}
