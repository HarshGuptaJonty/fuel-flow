import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFullEntryComponent } from './new-full-entry.component';

describe('NewFullEntryComponent', () => {
  let component: NewFullEntryComponent;
  let fixture: ComponentFixture<NewFullEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFullEntryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(NewFullEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
