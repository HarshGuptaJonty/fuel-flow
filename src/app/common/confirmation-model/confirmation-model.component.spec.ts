import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConfirmationModelComponent } from './confirmation-model.component';
import { ConfirmationModelService } from '../../services/confirmation-model.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';

describe('ConfirmationModelComponent', () => {
  let component: ConfirmationModelComponent;
  let fixture: ComponentFixture<ConfirmationModelComponent>;
  let mockConfirmationModelService: jasmine.SpyObj<ConfirmationModelService>;

  beforeEach(waitForAsync(() => {
    mockConfirmationModelService = jasmine.createSpyObj('ConfirmationModelService', ['confirmationModelData$']);
    mockConfirmationModelService.confirmationModelData$ = of({
      heading: 'Test Heading',
      message: 'Test Message',
      leftButton: { text: 'Left', customClass: '', disabled: false },
      rightButton: { text: 'Right', customClass: '', disabled: false }
    });
    mockConfirmationModelService.onButtonClick = new Subject<string>();

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        ConfirmationModelComponent
      ],
      providers: [
        { provide: ConfirmationModelService, useValue: mockConfirmationModelService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmationModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onleftButtonClick and emit "left" event', () => {
    spyOn(mockConfirmationModelService.onButtonClick, 'next');
    component.onleftButtonClick();
    expect(mockConfirmationModelService.onButtonClick.next).toHaveBeenCalledWith('left');
  });

  it('should call onRightButtonClick and emit "right" event', () => {
    spyOn(mockConfirmationModelService.onButtonClick, 'next');
    component.onRightButtonClick();
    expect(mockConfirmationModelService.onButtonClick.next).toHaveBeenCalledWith('right');
  });

  it('should call onleftButtonClick when left button is clicked', waitForAsync(() => {
    spyOn(component, 'onleftButtonClick');
    fixture.whenStable().then(() => {
      fixture.detectChanges(); // Ensure the view is updated
      const buttons = fixture.debugElement.queryAll(By.css('.custom-btn'));
      const leftButton = buttons[0];
      leftButton.triggerEventHandler('click', null);
      expect(component.onleftButtonClick).toHaveBeenCalled();
    });
  }));

  it('should call onRightButtonClick when right button is clicked', waitForAsync(() => {
    spyOn(component, 'onRightButtonClick');
    fixture.whenStable().then(() => {
      fixture.detectChanges(); // Ensure the view is updated
      const buttons = fixture.debugElement.queryAll(By.css('.custom-btn'));
      const rightButton = buttons[1];
      rightButton.triggerEventHandler('click', null);
      expect(component.onRightButtonClick).toHaveBeenCalled();
    });
  }));
});