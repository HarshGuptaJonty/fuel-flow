import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { DataForExportFormat } from '../../assets/models/ExportEntry';
import { NotificationService } from './notification.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(
    private notificationService: NotificationService
  ) { }

  exportToExcel(data: DataForExportFormat[], allTotalExportData: any, includeCustomerName = true, filePrefix = 'Inventory'): void {
    const convertedFormat = this.convertData(data, includeCustomerName);
    convertedFormat.push(allTotalExportData);

    const fileName = filePrefix + '_' + this.generateFileName();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(convertedFormat);
    const workbook: XLSX.WorkBook = { Sheets: { 'Sheet 1': worksheet }, SheetNames: ['Sheet 1'] };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    this.notificationService.exporting(fileName);
  }

  private convertData(data: DataForExportFormat[], includeCustomerName = true) {
    const convertedFormat: any[] = [];
    data.reverse();

    const exportTotal: any = {};
    exportTotal['Date'] = '';
    if (includeCustomerName) exportTotal['Customer'] = '';
    exportTotal['Address'] = '';
    exportTotal['Delivery Person'] = '';
    exportTotal['Product'] = 'Total';
    exportTotal['Sent'] = 0;
    exportTotal['Receieved'] = 0;
    exportTotal['Pending'] = 0;
    exportTotal['Rate/Unit'] = '';
    exportTotal['Total Amount'] = 0;
    exportTotal['Paid Amount'] = 0;
    exportTotal['Due Amount'] = 0;

    data.forEach((item: DataForExportFormat) => {
      if (item.productDetail && item.productDetail.length > 0) {
        let isFirstRow = true;
        for (const product of item.productDetail) {
          const newObject: any = {};

          let recieve: any = product.recievedUnits;
          if (!product.productData.productReturnable)
            recieve = '';

          let pending: any = (product.sentUnits || 0) - (product.recievedUnits || 0);
          if (!product.productData.productReturnable)
            pending = '';

          if (isFirstRow) {
            newObject['Date'] = item.date || '';
            if (includeCustomerName) newObject['Customer'] = item.customer.fullName || '';
            newObject['Address'] = item.shippingAddress || '';
            newObject['Delivery Person'] = item.deliveryBoy.fullName || '';
          } else {
            newObject['Date'] = '';
            if (includeCustomerName) newObject['Customer'] = '';
            newObject['Address'] = '';
            newObject['Delivery Person'] = '';
          }

          newObject['Product'] = product.productData.name || '';
          newObject['Sent'] = product.sentUnits || 0;
          newObject['Receieved'] = recieve || 0;
          newObject['Pending'] = pending || 0;
          newObject['Rate/Unit'] = product.productData.rate || 0;

          if (isFirstRow) {
            newObject['Total Amount'] = item.totalAmt || 0;
            newObject['Paid Amount'] = 1 * (item.paymentAmt || 0);
            newObject['Due Amount'] = (item.totalAmt || 0) - (item.paymentAmt || 0);

            isFirstRow = false;

            exportTotal['Total Amount'] += newObject['Total Amount'];
            exportTotal['Paid Amount'] += newObject['Paid Amount'];
            exportTotal['Due Amount'] += newObject['Due Amount'];
          } else {
            newObject['Total Amount'] = '';
            newObject['Paid Amount'] = '';
            newObject['Due Amount'] = '';
          }

          exportTotal['Sent'] += product.productData.productReturnable ? newObject['Sent'] : 0;
          exportTotal['Receieved'] += recieve === '' ? 0 : newObject['Receieved'];
          exportTotal['Pending'] += pending === '' ? 0 : newObject['Pending'];

          convertedFormat.push(newObject);
        }
      } else {
        const newObject: any = {};
        newObject['Date'] = item.date || '';
        if (includeCustomerName) newObject['Customer'] = item.customer.fullName || '';
        newObject['Address'] = item.shippingAddress || '';
        newObject['Delivery Person'] = item.deliveryBoy.fullName || '';
        newObject['Product'] = '';
        newObject['Sent'] = '';
        newObject['Receieved'] = '';
        newObject['Pending'] = '';
        newObject['Rate/Unit'] = '';
        newObject['Total Amount'] = 0
        newObject['Paid Amount'] = 1 * (item.paymentAmt || 0);
        newObject['Due Amount'] = 0 - (item.paymentAmt || 0);

        exportTotal['Paid Amount'] += newObject['Paid Amount'];
        exportTotal['Due Amount'] += newObject['Due Amount'];

        convertedFormat.push(newObject);
      }
    });

    convertedFormat.push({});
    convertedFormat.push(exportTotal);

    return convertedFormat;
  }

  exportToPdf(data: DataForExportFormat[], includeCustomerName = true, filePrefix = 'Inventory'): void {
    const convertedFormat = this.convertData(data, includeCustomerName);

    const doc = new jsPDF('landscape');
    const fileName = filePrefix + '_' + this.generateFileName() + '.pdf';

    const columns = Object.keys(convertedFormat[0]).map(key => ({ title: key, dataKey: key })); // title refer to the column names and dataKey refer to key of object
    const rows = convertedFormat.map(entry => Object.values(entry)); // object inside object cant be processed here properly

    (doc as any).autoTable({
      head: [columns],
      body: rows,
    });

    doc.save(fileName);
    this.notificationService.exporting(fileName);
  }

  private generateFileName(): string {
    const now = new Date();
    const pad = (num: number) => num.toString().padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1); // Months are zero-based
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}${month}${year}_${hours}${minutes}${seconds}`;
  }
}
