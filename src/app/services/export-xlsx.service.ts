import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { InventoryExportEntry } from '../../assets/models/ExportEntry';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ExportXlsxService {

  constructor(
    private notificationService: NotificationService
  ) { }

  exportToExcel(data: InventoryExportEntry[], filePrefix: string = 'Inventory_'): void {
    const fileName = filePrefix + this.generateFileName();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'Inventory': worksheet }, SheetNames: ['Inventory'] };
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    this.notificationService.xlsxExporting(fileName);
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
