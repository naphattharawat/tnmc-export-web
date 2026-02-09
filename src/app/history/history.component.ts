import { Component, OnInit } from '@angular/core';
import { HistoryService, HistoryItem } from '../service/history.service';

interface DetailView {
  text: string;
  time?: string | null;
}

interface FileView {
  label: string;
  url?: string | null;
}

interface HistoryView {
  id: string;
  date?: string | null;
  state_name: string;
  details: DetailView[];
  files: FileView[];
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  rows: HistoryView[] = [];

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.load();
  }

  async load(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const items = await this.historyService.getHistory();
      this.rows = this.transform(items);
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'โหลดข้อมูลไม่สำเร็จ';
      this.rows = [];
    } finally {
      this.isLoading = false;
    }
  }

  downloadFile(url?: string | null): void {
    if (!url) return;
    window.open(url, '_blank');
  }

  private transform(items: HistoryItem[]): HistoryView[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const mapped = items.map((item, index) => {
      console.log('x',item);
      
      const log = item?.log ?? item ?? {};
      const date = this.pickDate(log);
      const stateName = item?.state_name ?? item?.state_name ?? '-';
      const details = (item?.details ?? []).map((detail) => ({
        text: this.detailText(detail),
        time: this.pickDate(detail),
      }));

      return {
        id: String(this.pickValue(log, ['id', 'log_id', 'logId', 'ID']) ?? `row-${index}`),
        date,
        state_name: String(stateName),
        details,
        files: this.buildFiles(log),
      };
    });

    const filtered = mapped.filter((row) => {
      const ts = this.parseDate(row.date);
      if (ts === null) return true;
      return ts <= today.getTime();
    });

    return filtered.sort((a, b) => {
      const ta = this.parseDate(a.date) ?? 0;
      const tb = this.parseDate(b.date) ?? 0;
      return tb - ta;
    });
  }

  private parseDate(value?: string | null): number | null {
    if (!value) return null;
    const d = new Date(value);
    const time = d.getTime();
    return Number.isNaN(time) ? null : time;
  }

  private pickValue(obj: Record<string, any>, keys: string[]): any {
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return null;
  }

  private pickDate(obj: Record<string, any>): string | null {
    const keys = [
      'created_at',
      'created_date',
      'created_datetime',
      'log_date',
      'log_datetime',
      'process_date',
      'process_datetime',
      'run_date',
      'run_datetime',
      'date',
      'datetime',
      'updated_at',
      'updated_date',
    ];
    const value = this.pickValue(obj, keys);
    return value ? String(value) : null;
  }

  private detailText(detail: Record<string, any>): string {
    const keys = ['detail', 'message', 'description', 'status', 'state', 'state_id', 'step', 'name'];
    const value = this.pickValue(detail, keys);
    if (value) return String(value);

    const pairs = Object.entries(detail)
      .filter(([_, v]) => v !== null && v !== undefined && v !== '')
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${v}`);
    return pairs.length ? pairs.join(' | ') : '-';
  }

  private buildFiles(log: Record<string, any>): FileView[] {
    const fileCandidates = [
      { label: 'ไฟล์ที่ 1', keys: ['file1', 'file_1', 'file01', 'file_a', 'file_alive', 'file_live'] },
      { label: 'ไฟล์ที่ 2', keys: ['file2', 'file_2', 'file02', 'file_b', 'file_dead', 'file_death'] },
      { label: 'ไฟล์ที่ 3', keys: ['file3', 'file_3', 'file03', 'file_c', 'file_lost', 'file_missing'] },
    ];

    return fileCandidates.map((file) => {
      const value = this.pickValue(log, file.keys);
      const url = value ? String(value) : null;
      return { label: file.label, url };
    });
  }

}
