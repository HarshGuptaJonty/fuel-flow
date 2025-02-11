import { TestBed } from '@angular/core/testing';

import { CustomerDataServiceService } from './customer-data-service.service';

describe('CustomerDataServiceService', () => {
  let service: CustomerDataServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerDataServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
