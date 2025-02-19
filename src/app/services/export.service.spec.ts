import { TestBed } from '@angular/core/testing';
import { ExportService } from './export.service';
import { NotificationService } from './notification.service';
import * as XLSX from 'xlsx';
import { InventoryExportEntry } from '../../assets/models/ExportEntry';

describe('ExportService', () => {
  let service: ExportService;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['exporting']);

    TestBed.configureTestingModule({
      providers: [
        ExportService,
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });

    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

    it('should export data to Excel', () => {
    const data: InventoryExportEntry[] = [
      { Date: '01 January 2024', 'Customer Name': '1', 'Delivery Person Name': 'Item 1', 'Sent Quantity': 10 },
      { Date: '02 January 2024', 'Customer Name': '2', 'Delivery Person Name': 'Item 2', 'Sent Quantity': 20 }
    ];
  
    spyOn(XLSX.utils, 'json_to_sheet').and.callThrough();
  
    service.exportToExcel(data);
  
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(mockNotificationService.exporting).toHaveBeenCalled();
  });

  it('should export data to PDF', () => {
    const data: InventoryExportEntry[] = [
      { Date: '01 January 2024', 'Customer Name': '1', 'Delivery Person Name': 'Item 1', 'Sent Quantity': 10 },
      { Date: '02 January 2024', 'Customer Name': '2', 'Delivery Person Name': 'Item 2', 'Sent Quantity': 20 }
    ];

    service.exportToPdf(data);

    expect(mockNotificationService.exporting).toHaveBeenCalled();
  });

  it('should generate a file name', () => {
    const fileName = service['generateFileName']();
    expect(fileName).toMatch(/^\d{2}\d{2}\d{4}_\d{2}\d{2}\d{2}$/);
  });
});