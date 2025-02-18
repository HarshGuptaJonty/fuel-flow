import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EntryDetailComponent } from './entry-detail.component';
import { EntryDetailModelService } from '../../services/entry-detail-model.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

describe('EntryDetailComponent', () => {
  let component: EntryDetailComponent;
  let fixture: ComponentFixture<EntryDetailComponent>;
  let mockEntryDetailModelService: jasmine.SpyObj<EntryDetailModelService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(waitForAsync(() => {
    mockEntryDetailModelService = jasmine.createSpyObj('EntryDetailModelService', ['hideModel', 'getDeliveryBoyData']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['somethingWentWrong']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatButtonModule,
        EntryDetailComponent
      ],
      providers: [
        { provide: EntryDetailModelService, useValue: mockEntryDetailModelService },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call hideModel on onClose', () => {
    component.onClose();
    expect(mockEntryDetailModelService.hideModel).toHaveBeenCalled();
  });

  it('should navigate to delivery boy profile if userId exists', () => {
    const deliveryBoy = { userId: '123', fullName: 'John Doe' };
    mockEntryDetailModelService.getDeliveryBoyData.and.returnValue(deliveryBoy);

    component.openDeliveryBoyProfile();

    expect(mockEntryDetailModelService.hideModel).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/delivery'], { queryParams: { userId: '123' } });
  });

  it('should show notification if deliveryBoy is null', () => {
    mockEntryDetailModelService.getDeliveryBoyData.and.returnValue(undefined);

    component.openDeliveryBoyProfile();

    expect(mockEntryDetailModelService.hideModel).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockNotificationService.somethingWentWrong).toHaveBeenCalledWith('111');
  });
});