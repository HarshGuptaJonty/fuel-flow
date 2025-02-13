import { TestBed } from '@angular/core/testing';

import { ConfirmationModelService } from './confirmation-model.service';

describe('ConfirmationModelService', () => {
  let service: ConfirmationModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
