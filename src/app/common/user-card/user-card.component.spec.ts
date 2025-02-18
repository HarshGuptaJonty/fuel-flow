import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { UserCardComponent } from './user-card.component';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(waitForAsync(() => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showNotification']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UserCardComponent
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.userObject = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'qwerty'
      }
    };
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    component.userObject = {
      data: {
        fullName: 'testData',
        phoneNumber: '1234567890',
        userId: 'qwerty'
      }
    };
    component.ngOnInit();
    expect(component.data).toEqual({
      fullName: 'testData',
      phoneNumber: '1234567890',
      userId: 'qwerty'
    });
  });

  it('should stop event propagation on copyData method', () => {
    const event = jasmine.createSpyObj('event', ['stopPropagation']);
    component.copyData(event, 'testData');
    expect(event.stopPropagation).toHaveBeenCalled();
  });
});