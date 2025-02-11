import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

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

  getNumberInformat(number: string) {
    if (number && number.length == 10)
      return number.slice(0, 3) + '-' + number.slice(3, 6) + '-' + number.slice(6);
    return number;
  }

  copyData(data: string) {
    navigator.clipboard.writeText(data).then(() => {
      //TODO: show notification for success
    }).catch((error) => {
      //TODO: show notification for Error
    })
  }
}
