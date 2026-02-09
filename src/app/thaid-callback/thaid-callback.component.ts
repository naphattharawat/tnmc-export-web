import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-thaid-callback',
  templateUrl: './thaid-callback.component.html',
  styleUrls: ['./thaid-callback.component.css']
})
export class ThaidCallbackComponent implements OnInit {
  status = 'กำลังรับข้อมูลจาก THAID...';
  message: string | null = null;
  isLoading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['error']) {
        this.status = 'รับ callback ไม่สำเร็จ';
        this.message = params['error_description'] || params['error'];
        return;
      }

      if (params['code']) {
        void this.exchangeCode(params['code'], params['state']);
        return;
      }

      this.status = 'กำลังรอ callback จาก THAID...';
      this.message = null;
    });
  }

  private async exchangeCode(code: string, state?: string): Promise<void> {
    this.isLoading = true;
    this.status = 'รับ callback แล้ว กำลังแลก token...';
    this.message = null;

    try {
      const token = await this.loginService.exchangeThaidCode(code, state);
      if (!token) {
        this.status = 'ไม่พบ token จากระบบ';
        this.message = 'กรุณาลองใหม่อีกครั้ง';
        return;
      }

      sessionStorage.setItem('token', token);
      this.status = 'ยืนยันตัวตนสำเร็จ';
      this.message = 'บันทึก token แล้ว';
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('THAID callback error:', error);
      this.status = 'แลก token ไม่สำเร็จ';
      this.message = 'กรุณาลองใหม่อีกครั้ง';
    } finally {
      this.isLoading = false;
    }
  }
}
