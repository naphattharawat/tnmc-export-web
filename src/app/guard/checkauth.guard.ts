import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Injectable({
  providedIn: 'root'
})
export class CheckauthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  canActivate(): boolean {
    return this.isAuthenticated();
  }

  canActivateChild(): boolean {
    return this.isAuthenticated();
  }

  private isAuthenticated(): boolean {
    if (!this.loginService.hasValidToken()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
