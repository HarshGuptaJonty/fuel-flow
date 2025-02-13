import { TestBed } from '@angular/core/testing';

import { EntryDetailModelService } from './entry-detail-model.service';

describe('EntryDetailModelService', () => {
  let service: EntryDetailModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntryDetailModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
