import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';
import { BehaviorSubject } from 'rxjs';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService]
    });

    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial search text as empty string', (done) => {
    service.searchText$.subscribe((text) => {
      expect(text).toBe('');
      done();
    });
  });

  it('should update search text', (done) => {
    const newText = 'test search';

    service.updateSearchText(newText);

    service.searchText$.subscribe((text) => {
      expect(text).toBe(newText);
      done();
    });
  });
});