import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationModelComponent } from './confirmation-model.component';

describe('ConfirmationModelComponent', () => {
  let component: ConfirmationModelComponent;
  let fixture: ComponentFixture<ConfirmationModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModelComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmationModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
