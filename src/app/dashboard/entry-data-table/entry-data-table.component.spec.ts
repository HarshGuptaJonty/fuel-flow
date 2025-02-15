import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryDataTableComponent } from './entry-data-table.component';

describe('DataTableComponent', () => {
  let component: EntryDataTableComponent;
  let fixture: ComponentFixture<EntryDataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntryDataTableComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EntryDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
