import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryPersonComponent } from './delivery-person.component';

describe('DeliveryPersonComponent', () => {
  let component: DeliveryPersonComponent;
  let fixture: ComponentFixture<DeliveryPersonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryPersonComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeliveryPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
