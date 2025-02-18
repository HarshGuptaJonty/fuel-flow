import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from '../../services/notification.service';
import { Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

fdescribe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;
  let mockRenderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['']);
    mockRenderer = jasmine.createSpyObj('Renderer2', ['listen', 'removeClass', 'addClass']);

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        NotificationComponent
      ],
      providers: [
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Renderer2, useValue: mockRenderer }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle class on mouseover', () => {
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notification-container');
    document.body.appendChild(notificationContainer);

    mockRenderer.listen.and.callFake((target, event, callback) => {
      target.addEventListener(event, callback);
      return () => target.removeEventListener(event, callback);
    });

    spyOn(document, 'querySelector').and.returnValue(notificationContainer);

    component.ngAfterViewInit();

    const mouseoverEvent = new Event('mouseover');
    notificationContainer.dispatchEvent(mouseoverEvent);
    expect(component.currentPosition).toBe('left');

    notificationContainer.dispatchEvent(mouseoverEvent);
    expect(component.currentPosition).toBe('right');

    document.body.removeChild(notificationContainer);
  });
});