import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { Notification } from '../../assets/models/Notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });

    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show notification', (done) => {
    const notification: Notification = {
      heading: 'Test Notification',
      message: 'This is a test notification',
      duration: 1000,
      leftBarColor: service.color.green
    };

    service.showNotification(notification);

    service.notification$.subscribe((notifications) => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Test Notification');
      expect(notifications[0].message).toBe('This is a test notification');
      expect(notifications[0].leftBarColor).toBe(service.color.green);
      done();
    });
  });

  it('should remove notification after duration', (done) => {
    const notification: Notification = {
      heading: 'Test Notification',
      message: 'This is a test notification',
      duration: 1000,
      leftBarColor: service.color.green
    };

    service.showNotification(notification);

    setTimeout(() => {
      service.notification$.subscribe((notifications) => {
        expect(notifications.length).toBe(0);
        done();
      });
    }, 1500);
  });

  it('should show logged out notification', () => {
    service.loggedOut();

    service.notification$.subscribe((notifications) => {
      // expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Logged Out Successfully.');
      expect(notifications[0].leftBarColor).toBe(service.color.green);
    });
  });

  it('should show not authorized notification', () => {
    service.notAuthorized();

    service.notification$.subscribe((notifications) => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Not Authorized.');
      expect(notifications[0].message).toBe('Please login again.');
      expect(notifications[0].leftBarColor).toBe(service.color.red);
    });
  });

  it('should show something went wrong notification', () => {
    service.somethingWentWrong('404');

    service.notification$.subscribe((notifications) => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Something Went Wrong!');
      expect(notifications[0].message).toBe('Please Contact IT Support! Code:404');
      expect(notifications[0].leftBarColor).toBe(service.color.red);
    });
  });

  it('should show transaction list refreshed notification', () => {
    service.transactionListRefreshed();

    service.notification$.subscribe((notifications) => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Transaction list refreshed.');
      expect(notifications[0].leftBarColor).toBe(service.color.green);
    });
  });

  it('should show exporting notification', () => {
    service.exporting('test-file.xlsx');

    service.notification$.subscribe((notifications) => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].heading).toBe('Exporting...');
      expect(notifications[0].message).toBe('test-file.xlsx');
      expect(notifications[0].leftBarColor).toBe(service.color.green);
    });
  });
});