import { Injectable } from "@angular/core";
import { AccountService } from "../services/account.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class authGuard {
  constructor(
    private accountService: AccountService,
    private router: Router
  ) { }

  canActivate() {
    if (this.accountService.hasUserData()) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false;// this will disable the route in route.ts file if user is not logged in and uppe rline will navigate to /auth
    }
  }
}