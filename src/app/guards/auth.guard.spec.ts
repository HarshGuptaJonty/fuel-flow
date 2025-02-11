import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AccountService } from '../services/account.service';
import { of } from 'rxjs';

describe('authGuard', () => {
  let guard: authGuard;
  let accountService: jasmine.SpyObj<AccountService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['hasAuthData']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        authGuard,
        { provide: AccountService, useValue: accountServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(authGuard);
    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user has auth data', () => {
    accountService.hasAuthData.and.returnValue(true);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should prevent activation and navigate to /auth if user does not have auth data', () => {
    accountService.hasAuthData.and.returnValue(false);

    expect(guard.canActivate()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });
});