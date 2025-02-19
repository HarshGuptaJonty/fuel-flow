import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { LOCAL_STORAGE_KEYS } from '../shared/constants';

describe('AccountService', () => {
  let service: AccountService;
  let mockAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', ['signOut']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['notAuthorized']);

    TestBed.configureTestingModule({
      providers: [
        AccountService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    });

    service = TestBed.inject(AccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get auth data', () => {
    const authData = { user: { uid: 'testUid' } };
    service.setAuthData(authData);
    expect(service.getAuthData()).toEqual(authData);
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_PROFILE)).toEqual(JSON.stringify(authData));
  });

  it('should check if auth data exists', () => {
    const authData = { user: { uid: 'testUid' } };
    service.setAuthData(authData);
    expect(service.hasAuthData()).toBeTrue();
  });

  it('should set and get user data', () => {
    const userData = { name: 'testUser' };
    service.setUserData(userData);
    expect(service.getUserData()).toEqual(userData);
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.USER_PROFILE)).toEqual(JSON.stringify(userData));
  });

  it('should check if user data exists', () => {
    const userData = { name: 'testUser' };
    service.setUserData(userData);
    expect(service.hasUserData()).toBeTrue();
  });

  it('should get user ID if auth data exists', () => {
    const authData = { user: { uid: 'testUid' } };
    service.setAuthData(authData);
    expect(service.getUserId()).toBe('testUid');
  });

  it('should sign out if user ID does not exist', () => {
    service.setAuthData(null);
    service.getUserId();
    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
    expect(mockNotificationService.notAuthorized).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should sign out and clear data', () => {
    service.signOut();
    expect(mockAngularFireAuth.signOut).toHaveBeenCalled();
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_PROFILE)).toBeNull();
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.USER_PROFILE)).toBeNull();
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.CUSTOMER_DATA)).toBeNull();
    expect(sessionStorage.getItem(LOCAL_STORAGE_KEYS.DELIVERY_PERSON_DATA)).toBeNull();
    expect(service.getAuthData()).toBeNull();
    expect(service.getUserData()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });
});