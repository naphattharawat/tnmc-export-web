import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CheckauthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router) {}

  canActivate(): boolean {
    return this.isAuthenticated();
  }

  canActivateChild(): boolean {
    return this.isAuthenticated();
  }

  private isAuthenticated(): boolean {
    const sessionToken = sessionStorage.getItem('token');
    const hasToken = Boolean(sessionToken);

    if (!hasToken) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
