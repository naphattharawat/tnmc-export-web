import { Component, OnInit } from '@angular/core';
import { HistoryService, HistoryItem } from '../service/history.service';
import { ProcessService } from '../service/process.service';

interface DetailView {
  text: string;
  time?: string | null;
}

interface HistoryView {
  id: string;
  date?: string | null;
  state_name: string;
  state_id?: number | null;
  details: DetailView[];
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

  constructor(private historyService: HistoryService, private processService: ProcessService) {}

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

  async exportBirth(row: HistoryView): Promise<void> {
    if (!row?.id) return;
    const token = this.getToken();
    if (!token) return;
    try {
      const blob = await this.processService.exportBirth(row.id, token);
      this.downloadBlob(blob, `export_birth_date_${row.id}.xlsx`);
    } catch {
      // ignore export errors
    }
  }

  async exportDeath(row: HistoryView): Promise<void> {
    if (!row?.id) return;
    const token = this.getToken();
    if (!token) return;
    try {
      const blob = await this.processService.exportDeath(row.id, token);
      this.downloadBlob(blob, `export_death_${row.id}.xlsx`);
    } catch {
      // ignore export errors
    }
  }

  private transform(items: HistoryItem[]): HistoryView[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const mapped = items.map((item, index) => {
      console.log('x',item);
      
      const log = item?.log ?? item ?? {};
      const date = this.pickDate(log);
      const stateName = item?.state_name ?? item?.state_name ?? '-';
      const stateId = this.pickNumber(item, log, ['state_id', 'stateId', 'state', 'status', 'step']);
      const details = (item?.details ?? []).map((detail) => ({
        text: this.detailText(detail),
        time: this.pickDate(detail),
      }));

      return {
        id: String(this.pickValue(log, ['id', 'log_id', 'logId', 'ID']) ?? `row-${index}`),
        date,
        state_name: String(stateName),
        state_id: stateId,
        details,
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

  private pickNumber(primary: Record<string, any>, fallback: Record<string, any>, keys: string[]): number | null {
    for (const key of keys) {
      const value = primary?.[key] ?? fallback?.[key];
      if (value === undefined || value === null || value === '') continue;
      const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
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

  private getToken(): string | null {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

}
