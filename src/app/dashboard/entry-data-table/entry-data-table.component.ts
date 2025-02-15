import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Customer } from '../../../assets/models/Customer';
import { MatTableModule } from '@angular/material/table';
import { EntryTransaction } from '../../../assets/models/EntryTransaction';
import { dateConverter } from '../../shared/commonFunctions';
import { MatButtonModule } from '@angular/material/button';
import { NewEntryComponent } from "../new-entry/new-entry.component";
import { EntryDataService } from '../../services/entry-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';

@Component({
  selector: 'app-entry-data-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    NewEntryComponent
  ],
  templateUrl: './entry-data-table.component.html',
  styleUrl: './entry-data-table.component.scss'
})
export class EntryDataTableComponent implements OnChanges {

  @Input() customerObject?: Customer;

  @ViewChild('plainText', { static: true }) plainText!: TemplateRef<any>;
  @ViewChild('amountText', { static: true }) amountText!: TemplateRef<any>;
  @ViewChild('nameText', { static: true }) nameText!: TemplateRef<any>;
  @ViewChild('actionText', { static: true }) actionText!: TemplateRef<any>;

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
    }, {
      key: 'action',
      label: 'Action',
      customClass: 'text-right',
      dataType: 'actionText'
    }
  ]

  pendingUnit: number = 0;
  dueAmount: number = 0;
  processedTableData?: any;
  rawTransactionList: EntryTransaction[] = [];
  newEntry: boolean = false;
  entryDataAvaliable: boolean = false;
  openTransaction?: EntryTransaction;

  constructor(
    private afAuth: AngularFireAuth,
    private enterDataService: EntryDataService,
    private notificationService: NotificationService,
    private confirmationModelService: ConfirmationModelService,
    private entryDetailModelService: EntryDetailModelService,
    private router: Router
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.pendingUnit = this.customerObject?.entry?.pendingCount || 0;
    this.dueAmount = this.customerObject?.entry?.dueAmount || 0;

    this.refreshEntryData(); // to refersh first time
    this.entryDataAvaliable = this.rawTransactionList.length > 0;

    this.enterDataService.isDataChanged.subscribe(flag => {
      if (flag) {
        this.entryDataAvaliable = true;
        this.refreshEntryData(); // to refresh when there is data changge
        this.newEntry = false;
      }
    });
  }

  refreshData() {
    if (this.entryDataAvaliable) {
      this.refreshEntryData();
      this.notificationService.transactionListRefreshed();
    } else {
      this.enterDataService.hardRefresh();

      this.notificationService.showNotification({
        heading: 'No data found!',
        message: 'Iniciating hard refresh.',
        duration: 4000,
        leftBarColor: this.notificationService.color.yellow
      });
    }
  }

  async refreshEntryData() {
    this.newEntry = false;
    this.pendingUnit = 0;
    this.dueAmount = 0;
    this.rawTransactionList = [];
    this.processedTableData = null;
    this.openTransaction = undefined;

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
      dueAmt: this.dueAmount,
      transactionId: item.data?.transactionId
    };
  }

  saveEntry(event: EntryTransaction) {
    this.enterDataService.addNewEntry(event, !!this.openTransaction);
  }

  editEntry(object: any) {
    this.confirmationModelService.showModel({
      heading: 'Edit Entry?',
      message: 'You are trying to edit an existing entry, are you sure?',
      leftButton: {
        text: 'Yes',
        customClass: this.confirmationModelService.CUSTOM_CLASS.GREY_BLUE,
      }, rightButton: {
        text: 'Cancel',
        customClass: this.confirmationModelService.CUSTOM_CLASS.GREY,
      }
    }).subscribe(result => {
      if (result === 'left') {
        this.confirmationModelService.hideModel();
        this.openTransaction = this.enterDataService.getTransactionList()?.[object?.transactionId];
        this.newEntry = true;
      } else
        this.confirmationModelService.hideModel();
    });
  }

  showMore(object: any) {
    let expandView = this.enterDataService.getTransactionList()?.[object?.transactionId];
    this.entryDetailModelService.showModel(expandView);
  }

  deleteEntry(object: any) {
    if (!object) {
      this.notificationService.somethingWentWrong('101');
      return;
    }
    this.enterDataService.deleteEntry(object);
  }

  openDeliveryBoyProfile(obj: any) {
    if (obj.userId) {
      this.router.navigate(['/dashboard/delivery'], { queryParams: { userId: obj.userId } });
    } else {
      this.notificationService.showNotification({
        heading: 'Profile not setup.',
        message: obj.fullName + "'s profile is not complete!",
        duration: 5000,
        leftBarColor: this.notificationService.color.yellow
      });
    }
  }

  getTemplate(dataType: string) {
    if (dataType === 'amountText') return this.amountText;
    if (dataType === 'nameText') return this.nameText;
    if (dataType === 'actionText') return this.actionText;
    return this.plainText;
  }

  displayedColumns(): string[] {
    return this.tableStructure.map(item => item.key);
  }
}