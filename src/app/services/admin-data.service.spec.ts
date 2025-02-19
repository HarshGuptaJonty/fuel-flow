import { TestBed } from '@angular/core/testing';
import { AdminDataService } from './admin-data.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FirebaseService } from './firebase.service';

describe('AdminDataService', () => {
  let service: AdminDataService;
  let mockAngularFireAuth: jasmine.SpyObj<AngularFireAuth>;
  let mockFirebaseService: jasmine.SpyObj<FirebaseService>;

  beforeEach(() => {
    mockAngularFireAuth = jasmine.createSpyObj('AngularFireAuth', ['signOut']);
    mockFirebaseService = jasmine.createSpyObj('FirebaseService', ['getData']);

    TestBed.configureTestingModule({
      providers: [
        AdminDataService,
        { provide: AngularFireAuth, useValue: mockAngularFireAuth },
        { provide: FirebaseService, useValue: mockFirebaseService }
      ]
    });

    service = TestBed.inject(AdminDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with data', async () => {
    const adminData = { 'user1': { data: { fullName: 'Admin User' } } };
    mockFirebaseService.getData.and.returnValue(Promise.resolve(adminData));

    await service['initialize']();

    service.adminList$.subscribe(data => {
      expect(data).toEqual(adminData);
    });

    service.isDataChanged.subscribe(changed => {
      expect(changed).toBeTrue();
    });
  });

  it('should initialize with no data', async () => {
    mockFirebaseService.getData.and.returnValue(Promise.resolve({}));

    await service['initialize']();

    service.adminList$.subscribe(data => {
      expect(data).toBeNull();
    });

    service.isDataChanged.subscribe(changed => {
      expect(changed).toBeFalse();
    });
  });

  it('should get admin data by user ID', () => {
    const adminData = { 'user1': { data: { fullName: 'Admin User' } } };
    service['adminList'].next(adminData);

    expect(service.getAdminData('user1')).toEqual(adminData['user1']);
    expect(service.getAdminData('user2')).toBeUndefined();
  });

  it('should return null if user ID is not provided', () => {
    expect(service.getAdminData()).toBeNull();
  });

  it('should get admin name by user ID', () => {
    const adminData = { 'user1': { data: { fullName: 'Admin User' } } };
    service['adminList'].next(adminData);

    expect(service.getAdminName('user1')).toBe('Admin User');
    expect(service.getAdminName('user2')).toBeUndefined();
  });

  it('should return "NA" if user ID is not provided', () => {
    expect(service.getAdminName()).toBe('NA');
  });
});