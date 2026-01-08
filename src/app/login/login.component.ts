import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { AlertService } from '../service/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private loginService: LoginService,
    private alertService: AlertService,
    private router: Router
  ) { }

  async login() {
    if (!this.username || !this.password) {
      this.alertService.error('ข้อมูลไม่ครบถ้วน', 'กรุณาป้อนชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    this.isLoading = true;

    try {
      const success = await this.loginService.login(this.username, this.password);

      if (success) {
        // this.alertService.success('เข้าสู่ระบบสำเร็จ', `ยินดีต้อนรับ ${this.username}`);
        // นำทางไปยังหน้า home หรือหน้าหลัก
        this.router.navigate(['/home']);
      } else {
        this.alertService.error('เข้าสู่ระบบล้มเหลว', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      this.alertService.error('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      this.isLoading = false;
    }
  }
}
