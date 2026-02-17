import { Component, OnInit } from '@angular/core';
import { LogsService } from '../service/logs.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  lines: string[] = [];

  constructor(private logsService: LogsService) {}

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      this.lines = await this.logsService.getLogs();
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'โหลดข้อมูลไม่สำเร็จ';
      this.lines = [];
    } finally {
      this.isLoading = false;
    }
  }
}
