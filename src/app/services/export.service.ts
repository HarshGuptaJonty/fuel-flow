import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { InventoryExportEntry } from '../../assets/models/ExportEntry';
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

  exportToExcel(data: InventoryExportEntry[], filePrefix: string = 'Inventory_'): void {
    const fileName = filePrefix + this.generateFileName();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Inventory': worksheet }, SheetNames: ['Inventory'] };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    this.notificationService.exporting(fileName);
  }

  exportToPdf(data: InventoryExportEntry[], filePrefix: string = 'Inventory_'): void {
    const doc = new jsPDF('landscape');
    const fileName = filePrefix + this.generateFileName() + '.pdf';

    const columns = Object.keys(data[0]).map(key => ({ title: key, dataKey: key })); // title refer to the column names and dataKey refer to key of object
    const rows = data.map(entry => Object.values(entry)); // object inside object cant be processed here properly

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
