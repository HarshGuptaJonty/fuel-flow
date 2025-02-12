import { TestBed } from '@angular/core/testing';

import { EntryDataService } from './entry-data.service';

describe('EntryDataService', () => {
  let service: EntryDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntryDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
