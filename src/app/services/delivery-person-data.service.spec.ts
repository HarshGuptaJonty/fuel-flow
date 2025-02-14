import { TestBed } from '@angular/core/testing';

import { DeliveryPersonDataService } from './delivery-person-data.service';

describe('DeliveryPersonDataService', () => {
  let service: DeliveryPersonDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryPersonDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
