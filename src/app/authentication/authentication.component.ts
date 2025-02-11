import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { AccountService } from '../services/account.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
  imports: [
    CommonModule,
    NgxMaskDirective,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    provideNgxMask(),
    AngularFireAuth
  ],
})
export class AuthenticationComponent implements OnInit {

  message = {
    LOGIN: 'Log in.',
    SIGNUP: 'Sign up.',
    LOGIN_SUBTEXT: 'Login with your phone number linked to your registered account.',
    SIGNUP_SUBTEXT: 'Creare a new account using a phone number.',
  };

  loginForm: FormGroup = new FormGroup({
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    otp: new FormControl(''),
  });

  signupForm: FormGroup = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]),
    phoneNumber: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    accessKey: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(20)]),
    otp: new FormControl(''),
  });

  isLogin: boolean = true;
  isOtpSent: boolean = false;
  disableButtons: boolean = false;
  confirmationResult?: any;
  recaptchaVerifier?: any;
  activeFormGroup: FormGroup = this.loginForm;
  isMaleGender: boolean = true;
  accessKey: any;
  authData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private afAuth: AngularFireAuth,
    private accountService: AccountService,
    private firebaseService: FirebaseService
  ) { }

  async ngOnInit(): Promise<void> {
    if (this.accountService.hasAuthData()) {
      this.router?.navigate(['/dashboard']);
    }

    this.route.firstChild?.url.subscribe((url) => {
      this.isLogin = url[0]?.path === 'login';
      this.activeFormGroup = this.isLogin ? this.loginForm : this.signupForm;
    });

    this.accessKey = await this.firebaseService.getData('others/accessKey');
  }

  loginBtnClick() {
    if (this.isLogin) {
      this.initateOTPAction();
    } else {
      this.isLogin = true;
      this.activeFormGroup = this.loginForm;
    }
  }

  createNewAccBtnClick() {
    if (this.isLogin) {
      this.isLogin = false;
      this.activeFormGroup = this.signupForm;
    } else {
      if (this.accessKey) {
        if (this.accessKey.key === this.signupForm.get('accessKey')?.value && this.accessKey.number === this.signupForm.get('phoneNumber')?.value)
          this.initateOTPAction();
        else
          this.signupForm.get('phoneNumber')?.setErrors({ 'access-key-not-generated': true });
      } else
        this.signupForm.get('phoneNumber')?.setErrors({ 'access-key-not-generated': true });
    }
  }

  senOTP() {
    const auth = getAuth();

    this.disableButtons = true;

    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        'callback': (response: any) => {
          console.log('reCAPTCHA verified');
        }
      });
    }

    this.recaptchaVerifier.render().then(() => {
      signInWithPhoneNumber(auth, '+91' + this.activeFormGroup.get('phoneNumber')?.value, this.recaptchaVerifier)
        .then((confirmationResult) => {
          this.confirmationResult = confirmationResult;
          this.updateOtpSentStatus(true);
          this.disableButtons = false;
        })
        .catch((error) => {
          this.disableButtons = false;
          if (error.toString().includes('billing-not-enabled'))
            this.activeFormGroup.get('phoneNumber')?.setErrors({ 'billing-not-enabled': true });
        });
    });
  }

  verifyOtp() {
    let verificationCode = this.activeFormGroup.get('otp')?.value;
    this.disableButtons = true;
    this.confirmationResult?.confirm(verificationCode)
      .then((result: any) => {
        this.authData = result;
        this.disableButtons = false;
        this.authVerifiedCheckAndOpenDashboard();
      })
      .catch((error: any) => {
        this.activeFormGroup.get('otp')?.setErrors({ invalidOTP: true });
        this.activeFormGroup.updateValueAndValidity();
        this.disableButtons = false;
        console.log('Failed to verify OTP. Error:', error);
        //TODO: left bottom notification
      });
  }

  async authVerifiedCheckAndOpenDashboard() {
    let data = await this.firebaseService.getData(`admin/${this.authData?.user?.uid}`);
    if (data) {
      this.accountService.setAuthData(this.authData);
      this.accountService.setUserData(data);
      this.router?.navigate(['/dashboard']);
    } else {
      if (this.isLogin) {
        this.createNewAccBtnClick();
        //TODO: left bottom notification
      } else {
        data = {
          data: {
            fullName: this.activeFormGroup.get('fullName')?.value,
            male: this.isMaleGender,
            contact: {
              countryCode: '91',
              phoneNumber: this.activeFormGroup.get('phoneNumber')?.value,
            },
            importantTimes: {
              lastSeen: Date.now()
            },
            permission: {
              verified: false,
              blocked: false
            },
            userID: this.authData?.user?.uid
          }
        };

        this.firebaseService.setData(`admin/${this.authData?.user?.uid}`, data).then((result) => {
          this.accountService.setAuthData(this.authData);
          this.accountService.setUserData(data);
          this.router?.navigate(['/dashboard']);
        }).catch((error) => {
          //TODO: left bottom notification
        });
      }
    }
  }

  getErrorMessage(controlName: string) {
    if (controlName === 'phoneNumber') {
      if (this.activeFormGroup.controls[controlName].hasError('required'))
        return 'Please enter your contact number.';
      else if (this.activeFormGroup.controls[controlName].hasError('minlength'))
        return 'Please enter 10 digit phone number.';
      else if (this.activeFormGroup.controls[controlName].hasError('billing-not-enabled'))
        return 'Something went wrong! Please contact IT Support.';
      else if (this.activeFormGroup.controls[controlName].hasError('access-key-not-generated'))
        return 'No access key generated for this number! Please contact IT Support.';
    } else if (controlName === 'accessKey') {
      if (this.activeFormGroup.controls[controlName].hasError('required'))
        return 'Please enter your access key.';
      else if (this.activeFormGroup.controls[controlName].hasError('minlength'))
        return 'Please enter atleast 5 characters.';
    } else if (controlName === 'otp') {
      if (this.activeFormGroup.controls[controlName].hasError('required'))
        return 'Please enter OTP.';
      else if (this.activeFormGroup.controls[controlName].hasError('minlength'))
        return 'Please enter 6 digit OTP.';
      else if (this.activeFormGroup.controls[controlName].hasError('invalidOTP'))
        return 'Invalid OTP. Please try again.';
    }
    return '';
  }

  getShortName() {
    let name = this.signupForm.get('fullName')?.value;
    let names = name.split(' ');
    return names[0];
  }

  initateOTPAction() {
    if (this.isOtpSent)
      this.verifyOtp();
    else
      this.senOTP();
  }

  updateOtpSentStatus(newStatus: boolean) {
    if (newStatus) {
      this.activeFormGroup.get('phoneNumber')?.disable();
      this.activeFormGroup.get('otp')?.addValidators([Validators.required, Validators.minLength(6), Validators.maxLength(6)]);
    } else {
      this.activeFormGroup.get('phoneNumber')?.enable();
      this.activeFormGroup.get('otp')?.clearValidators();
      this.activeFormGroup.get('otp')?.reset();
    }
    this.activeFormGroup.get('otp')?.updateValueAndValidity();
    this.isOtpSent = newStatus;
  }
}
