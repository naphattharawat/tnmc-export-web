import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { AlertService } from '../service/alert.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  constructor(
    private loginService: LoginService,
    private alertService: AlertService,
    private router: Router
  ) {}

  logout(): void {
    this.loginService.logout();
    this.alertService.success('ออกจากระบบ', 'คุณได้ออกจากระบบแล้ว');
    this.router.navigate(['/login']);
  }
}
