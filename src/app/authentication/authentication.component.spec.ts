import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthenticationComponent } from './authentication.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { FirebaseService } from '../services/firebase.service';
import { NotificationService } from '../services/notification.service';
import { Database } from '@angular/fire/database';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from '../../environments/environment';

describe('AuthenticationComponent', () => {
  let component: AuthenticationComponent;
  let fixture: ComponentFixture<AuthenticationComponent>;
  const mockRouter = { navigate: jasmine.createSpy('navigate') };
  const mockAccountService = { hasUserData: jasmine.createSpy('hasUserData').and.returnValue(false) };
  const mockFirebaseService = { getData: jasmine.createSpy('getData').and.returnValue(Promise.resolve({ key: 'testKey', number: '1234567890' })) };
  const mockNotificationService = { showNotification: jasmine.createSpy('showNotification') };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        NgxMaskDirective,
        AuthenticationComponent
      ],
      providers: [
        provideNgxMask(),
        provideAnimations(),
        { provide: AngularFireAuth, useValue: jasmine.createSpyObj('AngularFireAuth', ['signInWithPhoneNumber', 'signOut']) },
        { provide: Router, useValue: mockRouter },
        { provide: AccountService, useValue: mockAccountService },
        { provide: FirebaseService, useValue: mockFirebaseService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Database, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('phoneNumber')).toBeDefined();
    expect(component.loginForm.get('otp')).toBeDefined();
  });

  it('should initialize signup form', () => {
    expect(component.signupForm).toBeDefined();
    expect(component.signupForm.get('fullName')).toBeDefined();
    expect(component.signupForm.get('phoneNumber')).toBeDefined();
    expect(component.signupForm.get('accessKey')).toBeDefined();
    expect(component.signupForm.get('otp')).toBeDefined();
  });

  it('should navigate to dashboard if user data exists', waitForAsync(() => {
    mockAccountService.hasUserData.and.returnValue(true);
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  }));

  it('should set accessKey on init', waitForAsync(() => {
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(component.accessKey).toEqual({ key: 'testKey', number: '1234567890' });
    });
  }));

  it('should switch to signup form on createNewAccBtnClick', () => {
    component.isLogin = true;
    component.createNewAccBtnClick();
    expect(component.isLogin).toBeFalse();
    expect(component.activeFormGroup).toBe(component.signupForm);
  });

  it('should switch to login form on loginBtnClick', () => {
    component.isLogin = false;
    component.loginBtnClick();
    expect(component.isLogin).toBeTrue();
    expect(component.activeFormGroup).toBe(component.loginForm);
  });

  it('should show error message for invalid phone number', () => {
    component.activeFormGroup.get('phoneNumber')?.setErrors({ 'required': true });
    expect(component.getErrorMessage('phoneNumber')).toBe('Please enter your contact number.');
  });

  it('should show error message for invalid access key', () => {
    component.createNewAccBtnClick();
    component.activeFormGroup.get('accessKey')?.setErrors({ 'required': true });
    expect(component.getErrorMessage('accessKey')).toBe('Please enter your access key.');
  });

  it('should show error message for invalid OTP', () => {
    component.activeFormGroup.get('otp')?.setErrors({ 'required': true });
    expect(component.getErrorMessage('otp')).toBe('Please enter OTP.');
  });

  it('should update OTP sent status', () => {
    component.updateOtpSentStatus(true);
    expect(component.isOtpSent).toBeTrue();
    expect(component.activeFormGroup.get('phoneNumber')?.disabled).toBeTrue();
    expect(component.activeFormGroup.get('otp')?.hasValidator(Validators.required)).toBeTrue();
  });
});
