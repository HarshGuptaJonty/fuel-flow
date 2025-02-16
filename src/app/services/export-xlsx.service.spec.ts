import { TestBed } from '@angular/core/testing';

import { ExportXlsxService } from './export-xlsx.service';

describe('ExportXlsxService', () => {
  let service: ExportXlsxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportXlsxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
