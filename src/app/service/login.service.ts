import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  ok: boolean;
  token?: string;
  message?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * ตรวจสอบการเข้าสู่ระบบ
   * @param username ชื่อผู้ใช้
   * @param password รหัสผ่าน
   * @returns Promise<boolean> true ถ้าล็อกอินสำเร็จ
   */
  login(username: string, password: string): Promise<boolean> {
    const loginData: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        map(response => {
          if (response.ok) {
            // บันทึก token และข้อมูลผู้ใช้
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('name', response.user?.name || '');
            if (response.user) {
              localStorage.setItem('user', JSON.stringify(response.user));
            }
            return true;
          } else {
            return false;
          }
        }),
        catchError(this.handleError)
      )
      .toPromise()
      .then(result => result ?? false)
      .catch(() => false);
  }

  /**
   * จัดการ error จาก API
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Login API Error:', error);
    return throwError(() => new Error('Login failed'));
  }

  /**
   * ตรวจสอบว่าล็อกอินอยู่หรือไม่
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * ออกจากระบบ
   */
  logout(): void {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * รับชื่อผู้ใช้ที่ล็อกอินอยู่
   */
  getCurrentUser(): string | null {
    return localStorage.getItem('username');
  }

  /**
   * รับ token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * รับข้อมูลผู้ใช้
   */
  getUserData(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}
