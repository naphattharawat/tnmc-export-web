import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProcessService } from '../service/process.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(
    private processService: ProcessService
  ) { }
  // active step index (1..5)
  activeStep = 1;

  // numeric state from backend (0..8)
  processState: number | null = null;
  isProcessing = false;
  private rowsByState: Record<number, number> = {};
  currentLogId: string | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private isStateLoading = false;

  // step objects with per-step state
  steps: { idleLabel: string; doneLabel?: string; state: 'idle' | 'in-progress' | 'done' }[] = [
    { idleLabel: 'กำลังดึงข้อมูลจากฐานข้อมูล', doneLabel: 'ดึงข้อมูลจากฐานข้อมูลสำเร็จ', state: 'idle' },
    { idleLabel: 'กำลังตรวจสอบข้อมูลกับ checkpop', doneLabel: 'ตรวจสอบข้อมูลกับ checkpop สำเร็จ', state: 'idle' },
    { idleLabel: 'รอ Login thaID', doneLabel: 'Login thaID แล้ว', state: 'idle' },
    { idleLabel: 'กำลังตรวจสอบข้อมูลกับ LK', doneLabel: 'ตรวจสอบข้อมูลกับ LK สำเร็จ', state: 'idle' },
    { idleLabel: 'เสร็จสิ้น', doneLabel: 'เสร็จสิ้น', state: 'idle' }
  ];

  // fetch state & result
  isFetching = false;
  recordCount = 0;
  // overall process status: 'idle' | 'process' | 'done' | 'error'
  status: 'idle' | 'process' | 'done' | 'error' = 'idle';

  // detailed status log entries
  statusLogs: { id?: string; date: string; status: string; detail: string }[] = [];

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  private readonly stateLabels: Record<number, string> = {
    0: 'เริ่มประมวลผล',
    1: 'กำลังดึงข้อมูลจากฐานข้อมูล',
    2: 'ดึงข้อมูลจากฐานข้อมูลสำเร็จ',
    3: 'กำลังตรวจสอบข้อมูลกับ checkpop',
    4: 'ตรวจสอบข้อมูลกับ checkpop สำเร็จ',
    5: 'รอ Login thaID',
    6: 'กำลังตรวจสอบข้อมูลกับ LK',
    7: 'ตรวจสอบข้อมูลกับ LK สำเร็จเสร็จสิ้น',
    8: 'เสร็จสิ้น'
  };

  simulateFetch() {
    // start fetching (step 1)
    if (this.status === 'process') return; // already processing
    this.statusLogs = [];
    this.recordCount = 0;

    this.setState(0);
    this.setState(1);

    // simulate network delay for step 1
    setTimeout(() => {
      // finished fetching
      this.isFetching = false;
      this.recordCount = 128; // example record count
      this.steps[0].doneLabel = `ดึงข้อมูลจากฐานข้อมูลสำเร็จ ทั้งหมด ${this.recordCount} record`;
      this.setState(2);

      setTimeout(() => {
        this.setState(3);

        setTimeout(() => {
          this.setState(4);

          setTimeout(() => {
            this.setState(5);

            setTimeout(() => {
              this.setState(6);

              setTimeout(() => {
                this.setState(7);

                setTimeout(() => {
                  this.setState(8);
                }, 900);
              }, 900);
            }, 900);
          }, 900);
        }, 900);
      }, 1200);

    }, 1500);
  }

  labelFor(i: number): string {
    const s = this.steps[i];
    if (!s) return '';
    const fetchRows = this.rowsForState(2);
    if (i === 0 && this.processState !== null && this.processState >= 2 && fetchRows !== null) {
      return `ดึงข้อมูลจากฐานข้อมูลสำเร็จ ${fetchRows} รายการ`;
    }
    const checkpopRows = this.rowsForState(3);
    if (i === 1 && this.processState !== null && this.processState >= 4 && checkpopRows !== null) {
      return `ตรวจสอบข้อมูลกับ checkpop สำเร็จ ${checkpopRows} รายการ`;
    }
    if (i === 1 && this.processState === 3 && checkpopRows !== null) {
      return `กำลังตรวจ checkpop ${checkpopRows} รายการ`;
    }
    if (s.state === 'in-progress') return s.idleLabel;
    if (s.state === 'done') return s.doneLabel ?? s.idleLabel;
    return s.idleLabel;
  }

  getStatusText(): string {
    if (this.status === 'error') return 'การประมวลผล Error';
    const fetchRows = this.rowsForState(2);
    if (this.processState === 2 && fetchRows !== null) {
      return `ดึงข้อมูลจากฐานข้อมูลสำเร็จ ${fetchRows} รายการ`;
    }
    const checkpopRows = this.rowsForState(3);
    if (this.processState === 3 && checkpopRows !== null) {
      return `กำลังตรวจ checkpop ${checkpopRows} รายการ`;
    }
    if (this.processState === 4 && checkpopRows !== null) {
      return `ตรวจสอบข้อมูลกับ checkpop สำเร็จ ${checkpopRows} รายการ`;
    }
    if (this.processState !== null) return this.stateLabel(this.processState);
    return '-';
  }

  pushLog(status: string, detail: string) {
    this.statusLogs.unshift({ date: new Date().toISOString(), status, detail });
  }

  manualProcess() {
    if (this.isProcessing) return;
    // reset steps
    this.processService.process();

    this.recordCount = 0;
    this.fetchState();
  }

  async exportDead(): Promise<void> {
    const logId = this.currentLogId;
    const token = this.getToken();
    if (!logId || !token) return;
    try {
      const blob = await this.processService.exportDeath(logId, token);
      this.downloadBlob(blob, `export_death_${logId}.xlsx`);
    } catch {
      // ignore export errors
    }
  }

  async exportInvalidDob(): Promise<void> {
    const logId = this.currentLogId;
    const token = this.getToken();
    if (!logId || !token) return;
    try {
      const blob = await this.processService.exportBirth(logId, token);
      this.downloadBlob(blob, `export_birth_date_${logId}.xlsx`);
    } catch {
      // ignore export errors
    }
  }

  private stateLabel(state: number): string {
    return this.stateLabels[state] ?? `สถานะไม่ทราบ (${state})`;
  }

  private setState(state: number): void {
    if (this.processState === state) return;
    this.processState = state;

    this.applyStateToSteps(state);
    this.pushLog(String(state), this.stateLabel(state));
  }

  private applyStateToSteps(state: number): void {
    this.steps.forEach((step) => {
      step.state = 'idle';
    });

    if (state <= 0) {
      this.activeStep = 1;
      return;
    }

    if (state === 1) {
      this.activeStep = 1;
      this.steps[0].state = 'in-progress';
      return;
    }

    if (state >= 2) {
      this.steps[0].state = 'done';
      this.activeStep = 2;
    }

    if (state === 3) {
      this.steps[1].state = 'in-progress';
      this.activeStep = 2;
      return;
    }

    if (state >= 4) {
      this.steps[1].state = 'done';
      this.activeStep = 3;
    }

    if (state === 5) {
      this.steps[2].state = 'in-progress';
      this.activeStep = 3;
      return;
    }

    if (state >= 6) {
      this.steps[2].state = 'done';
      this.activeStep = 4;
    }

    if (state === 6) {
      this.steps[3].state = 'in-progress';
      this.activeStep = 4;
      return;
    }

    if (state >= 7) {
      this.steps[3].state = 'done';
      this.activeStep = 5;
    }

    if (state === 8) {
      this.steps[4].state = 'done';
      this.activeStep = 5;
    }
  }

  private startPolling(): void {
    if (this.pollTimer) return;
    this.fetchState();
    this.pollTimer = setInterval(() => this.fetchState(),5000);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async fetchState(): Promise<void> {
    if (this.isStateLoading) return;
    this.isStateLoading = true;
    try {
      const res = await this.processService.getState();
      if (!res?.ok) return;
      const raw = res?.state;
      const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
      if (Number.isNaN(parsed)) return;
      this.setState(parsed);
      if (typeof res?.isProcessing === 'boolean') {
        this.isProcessing = res.isProcessing;
      }
      this.updateStatus();
      if (Array.isArray(res?.details)) {
        this.statusLogs = this.mapDetails(res.details);
        this.rowsByState = this.extractRowsByState(res.details);
        this.currentLogId = this.extractLogId(res.details);
      } else {
        this.rowsByState = {};
        this.currentLogId = null;
      }
    } catch {
      // ignore polling errors to avoid breaking UI
    } finally {
      this.isStateLoading = false;
    }
  }

  private extractRowsByState(details: any[]): Record<number, number> {
    const result: Record<number, number> = {};
    for (const detail of details) {
      const rawState = detail?.state_id ?? detail?.state ?? detail?.stateId;
      const stateId = typeof rawState === 'number' ? rawState : parseInt(String(rawState), 10);
      if (Number.isNaN(stateId)) continue;
      const rowsRaw = detail?.rows;
      const rowsCount = typeof rowsRaw === 'number' ? rowsRaw : parseInt(String(rowsRaw), 10);
      if (Number.isNaN(rowsCount)) continue;
      result[stateId] = rowsCount;
    }
    return result;
  }

  private rowsForState(stateId: number): number | null {
    const value = this.rowsByState[stateId];
    return typeof value === 'number' ? value : null;
  }

  private extractLogId(details: any[]): string | null {
    let maxNumeric: number | null = null;
    let fallback: string | null = null;
    for (const detail of details) {
      const raw = detail?.log_id ?? detail?.logId ?? detail?.logid ?? null;
      if (raw === null || raw === undefined || raw === '') continue;
      const parsed = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
      if (!Number.isNaN(parsed)) {
        if (maxNumeric === null || parsed > maxNumeric) {
          maxNumeric = parsed;
        }
      } else if (!fallback) {
        fallback = String(raw);
      }
    }
    if (maxNumeric !== null) return String(maxNumeric);
    return fallback;
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

  private mapDetails(details: any[]): { id?: string; date: string; status: string; detail: string }[] {
    const mapped = details.map((detail) => {
      const id = detail?.id ?? detail?.log_id ?? detail?.logId ?? null;
      const rawState = detail?.state_id ?? detail?.state ?? detail?.stateId;
      const stateId = typeof rawState === 'number' ? rawState : parseInt(String(rawState), 10);
      const statusLabel = Number.isNaN(stateId)
        ? 'สถานะไม่ทราบ'
        : `${stateId} - ${this.stateLabel(stateId)}`;
      const rowsRaw = detail?.rows;
      const rowsCount = typeof rowsRaw === 'number' ? rowsRaw : parseInt(String(rowsRaw), 10);
      const rowsText = Number.isNaN(rowsCount) ? '' : ` ${rowsCount} รายการ`;
      const note = detail?.note ?? detail?.detail ?? detail?.message ?? null;
      const date = detail?.created_date ?? detail?.created_at ?? detail?.date ?? detail?.datetime ?? null;
      return {
        id: id ? String(id) : '',
        date: date ? String(date) : new Date().toISOString(),
        status: `${statusLabel}${rowsText}`,
        detail: note ? String(note) : '-'
      };
    });

    return mapped.sort((a, b) => {
      const ia = this.parseId(a.id);
      const ib = this.parseId(b.id);
      if (ia !== null && ib !== null) return ia - ib;
      if (ia !== null) return -1;
      if (ib !== null) return 1;
      return 0;
    });
  }

  private parseId(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private updateStatus(): void {
    if (this.isProcessing) {
      this.status = 'process';
      return;
    }
    if (this.processState === 8) {
      this.status = 'done';
      return;
    }
    if (this.processState !== null) {
      this.status = 'error';
      return;
    }
    this.status = 'idle';
  }

}
