import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  /**
   * แสดงข้อความสำเร็จ
   * @param title หัวข้อ
   * @param text ข้อความเพิ่มเติม (ไม่บังคับ)
   */
  success(title: string, text?: string): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonText: 'ตกลง'
    });
  }

  /**
   * แสดงข้อความผิดพลาด
   * @param title หัวข้อ
   * @param text ข้อความเพิ่มเติม (ไม่บังคับ)
   */
  error(title: string, text?: string): void {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }

  /**
   * แสดงข้อความยืนยัน
   * @param title หัวข้อ
   * @param text ข้อความเพิ่มเติม (ไม่บังคับ)
   * @param confirmButtonText ข้อความปุ่มยืนยัน (ไม่บังคับ)
   * @param cancelButtonText ข้อความปุ่มยกเลิก (ไม่บังคับ)
   * @returns Promise<boolean> true ถ้าผู้ใช้ยืนยัน, false ถ้าผู้ใช้ยกเลิก
   */
  confirm(title: string, text?: string, confirmButtonText: string = 'ยืนยัน', cancelButtonText: string = 'ยกเลิก'): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d6d6d6',
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}
