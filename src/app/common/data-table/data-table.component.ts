import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { MatTableModule } from '@angular/material/table';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { dateConverter } from '../../shared/commonFunctions';
import { MatButtonModule } from '@angular/material/button';
import { NewEntryComponent } from "../../dashboard/new-entry/new-entry.component";
import { EntryDataService } from '../../services/entry-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-data-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    NewEntryComponent
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent implements OnInit {

  @Input() customerObject?: Customer;

  @ViewChild('plainText', { static: true }) plainText!: TemplateRef<any>;
  @ViewChild('amountText', { static: true }) amountText!: TemplateRef<any>;
  @ViewChild('nameText', { static: true }) nameText!: TemplateRef<any>;

  tableStructure = [
    {
      key: 'date',
      label: 'Date',
      dataType: 'plainText'
    }, {
      key: 'deliveryBoy',
      label: 'Delivery Boy',
      customClass: 'witdh-limit-200',
      dataType: 'nameText'
    }, {
      key: 'sent',
      label: 'Sent',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'recieved',
      label: 'Recieved',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'pending',
      label: 'Pending',
      customClass: 'text-right',
      dataType: 'plainText'
    }, {
      key: 'rate',
      label: 'Rate/Unit',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'totamAmt',
      label: 'Total Amount',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'paymentAmt',
      label: 'Payment',
      customClass: 'text-right',
      dataType: 'amountText'
    }, {
      key: 'dueAmt',
      label: 'Due Amount',
      customClass: 'text-right',
      dataType: 'amountText'
    }
  ]

  pendingUnit: number = 0;
  dueAmount: number = 0;
  processedTableData?: any;
  rawTransactionList: EntryTransaction[] = [];
  addNewEntry: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private enterDataService: EntryDataService
  ) { }

  ngOnInit(): void {
    this.pendingUnit = this.customerObject?.entry?.pendingCount || 0;
    this.dueAmount = this.customerObject?.entry?.dueAmount || 0;

    this.enterDataService.isDataChanged.subscribe(flag => {
      if (flag) {
        this.refreshEntryData();
        this.addNewEntry = false;
      }
    });
  }

  async refreshEntryData() {
    this.pendingUnit = 0;
    this.dueAmount = 0;
    this.rawTransactionList = [];
    this.processedTableData = null;

    this.rawTransactionList = this.enterDataService.getCustomerTransactionList(this.customerObject?.data?.userId);
    this.processedTableData = this.rawTransactionList.map((item: EntryTransaction) => this.transformItem(item)).reverse();
  }

  transformItem(item: EntryTransaction) {
    const sent = item.data?.sent || 0;
    const recieved = item.data?.recieved || 0;
    const rate = item.data?.rate || 0;
    const payment = item.data?.payment || 0;

    this.pendingUnit += sent - recieved;
    const totalAmt = sent * rate;
    this.dueAmount += sent * rate - payment;

    return {
      date: dateConverter(item.data?.date || ''),
      deliveryBoy: {
        fullName: item.data?.deliveryBoy?.fullName,
        userId: item.data?.deliveryBoy?.userId
      },
      sent: sent > 0 ? sent : '',
      recieved: recieved > 0 ? recieved : '',
      pending: this.pendingUnit,
      rate: rate > 0 ? rate : '',
      totamAmt: totalAmt > 0 ? totalAmt : '',
      paymentAmt: payment > 0 ? payment : '',
      dueAmt: this.dueAmount
    };
  }

  saveEntry(event: EntryTransaction) {
    this.enterDataService.addNewEntry(event);
  }

  openDeliveryBoyProfile(userId: any) {
    throw new Error('Method not implemented.');
  }

  getTemplate(dataType: string) {
    if (dataType === 'amountText') return this.amountText;
    if (dataType === 'nameText') return this.nameText;
    return this.plainText;
  }

  displayedColumns(): string[] {
    return this.tableStructure.map(item => item.key);
  }
}