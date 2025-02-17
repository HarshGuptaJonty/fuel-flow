import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { authGuard } from './auth.guard';
import { AccountService } from '../services/account.service';

describe('authGuard', () => {
  let guard: authGuard;
  let accountService: jasmine.SpyObj<AccountService>;
  let router: Router;

  beforeEach(() => {
    const accountServiceSpy = jasmine.createSpyObj('AccountService', ['hasUserData']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        authGuard,
        { provide: AccountService, useValue: accountServiceSpy }
      ]
    });

    guard = TestBed.inject(authGuard);
    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user has data', () => {
    accountService.hasUserData.and.returnValue(true);
    expect(guard.canActivate()).toBe(true);
  });

  it('should navigate to /auth if user does not have data', () => {
    accountService.hasUserData.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');
    expect(guard.canActivate()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
  });
});