import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // active step index (1..4)
  activeStep = 1;

  // step objects with per-step state
  steps: { idleLabel: string; doneLabel?: string; state: 'idle' | 'in-progress' | 'done' }[] = [
    { idleLabel: 'กำลังดึงข้อมูล', doneLabel: undefined, state: 'idle' },
    { idleLabel: 'กำลังตรวจสอบ checkpop', doneLabel: 'ตรวจสอบเสร็จแล้ว checkpop', state: 'idle' },
    { idleLabel: 'กำลังตรวจสอบ LK', doneLabel: 'ตรวจสอบเสร็จแล้ว LK', state: 'idle' },
    { idleLabel: 'เสร็จสิ้น', doneLabel: 'เสร็จสิ้น', state: 'idle' }
  ];

  // fetch state & result
  isFetching = false;
  recordCount = 0;
  // overall process status: 'idle' | 'process' | 'done'
  status: 'idle' | 'process' | 'done' = 'idle';

  // detailed status log entries
  statusLogs: { date: string; status: string; detail: string }[] = [];

  ngOnInit(): void {
    // simulate fetching for demo — remove or wire to real service
    this.simulateFetch();
  }

  simulateFetch() {
    // start fetching (step 1)
      if (this.status === 'process') return; // already processing
      this.status = 'process';
      this.statusLogs = [];
      this.pushLog('info', 'เริ่มกระบวนการ');

    this.isFetching = true;
    this.recordCount = 0;
    this.activeStep = 1;
    this.steps[0].state = 'in-progress';
      this.pushLog('in-progress', this.steps[0].idleLabel);

    // simulate network delay for step 1
    setTimeout(() => {
      // finished fetching
      this.isFetching = false;
      this.recordCount = 128; // example record count
      this.steps[0].doneLabel = `ดึงข้อมูลเสร็จแล้ว ทั้งหมด ${this.recordCount} record`;
      this.steps[0].state = 'done';
      this.pushLog('done', this.steps[0].doneLabel || 'ดึงข้อมูลเสร็จแล้ว');

      // advance to step 2 and simulate its check
      this.activeStep = 2;
      this.steps[1].state = 'in-progress';
  this.pushLog('in-progress', this.steps[1].idleLabel);

      setTimeout(() => {
        // finish step 2
        this.steps[1].state = 'done';
        this.pushLog('done', this.steps[1].doneLabel || 'ตรวจสอบเสร็จแล้ว');
        this.activeStep = 3;
        this.steps[2].state = 'in-progress';

        setTimeout(() => {
          // finish step 3
          this.steps[2].state = 'done';
          this.activeStep = 4;
          // step 4 stays as 'idle' or can be marked done depending on flow
          this.steps[3].state = 'done';
          this.status = 'done';
        }, 1300);
          this.steps[3].state = 'done';
          this.pushLog('done', this.steps[3].doneLabel || 'เสร็จสิ้น');

          // complete overall process
          this.status = 'done';
          this.pushLog('info', 'กระบวนการเสร็จสิ้น');

      }, 1500);

    }, 2000);
  }

  labelFor(i: number): string {
    const s = this.steps[i];
    if (!s) return '';
    if (s.state === 'in-progress') return s.idleLabel;
    if (s.state === 'done') return s.doneLabel ?? s.idleLabel;
    return s.idleLabel;
  }

  getStatusText(): string {
    if (this.status=== 'process') return 'กำลังประมวลผล...';
    else if (this.status === 'done') return 'เสร็จสิ้น';
    else return '-'

  }

  pushLog(status: string, detail: string) {
    this.statusLogs.unshift({ date: new Date().toISOString(), status, detail });
  }

  manualProcess() {
    if (this.status === 'process') return;
    // reset steps
    this.steps.forEach((s, idx) => {
      s.state = 'idle';
      if (idx === 0) s.doneLabel = undefined;
    });
    this.recordCount = 0;
    this.simulateFetch();
  }

}
