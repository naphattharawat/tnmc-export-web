import { Component, OnInit } from '@angular/core';
import { DateEntry } from '../models/date-entry';
import { DatesService } from '../service/dates.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  private readonly emptyEntry: DateEntry = {
    month: null,
    day: null,
    startTime: '00:00',
    hours: null
  };

  dates: DateEntry[] = [];
  pendingDates: string[] = [];
  saved = false;
  maxDates = 10;
  readonly months = [
    { value: 1, label: 'ม.ค.' },
    { value: 2, label: 'ก.พ.' },
    { value: 3, label: 'มี.ค.' },
    { value: 4, label: 'เม.ย.' },
    { value: 5, label: 'พ.ค.' },
    { value: 6, label: 'มิ.ย.' },
    { value: 7, label: 'ก.ค.' },
    { value: 8, label: 'ส.ค.' },
    { value: 9, label: 'ก.ย.' },
    { value: 10, label: 'ต.ค.' },
    { value: 11, label: 'พ.ย.' },
    { value: 12, label: 'ธ.ค.' }
  ];
  readonly days = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31
  ]

  constructor(private datesService: DatesService) { }

  ngOnInit(): void {
    void this.loadDates();
  }

  addDate(): void {
    if (this.dates.length < this.maxDates) {
      this.dates.push({ ...this.emptyEntry });
    }
    console.log(this.dates);

  }

  removeDate(index: number): void {
    if (this.dates.length > 1) {
      this.dates.splice(index, 1);
    } else {
      this.dates = [];
      this.dates.push({ ...this.emptyEntry });
    }
  }

  onMonthChange(index: number): void {
    const entry = this.dates[index];
    if (!entry || entry.month == null) {
      return;
    }
  }

  // daysForMonth(month: number | null): number[] {
  //   void month;
  //   return Array.from({ length: this.daysInMonth }, (_, idx) => idx + 1);
  // }

  save(): void {
    const filtered = this.dates
      .map(entry => this.formatEntry(entry))
      .filter((value): value is string => Boolean(value));
    this.pendingDates = filtered;
    this.saved = true;
    setTimeout(() => this.saved = false, 2000);
    console.log(this.dates);

    void this.saveDates();
  }

  private async loadDates(): Promise<void> {
    try {
      const result: any = await this.datesService.getDates();
      if (result.ok) {
        this.dates = result.data;
      } else {
        this.dates = [];
      }
    } catch (error) {
      console.error('Dates API Error (get):', error);
      if (!this.dates.length) {
        this.dates = [];
      }
    }
  }

  private async saveDates(): Promise<void> {
    try {
      await this.datesService.saveDates(this.dates);
    } catch (error) {
      console.error('Dates API Error (post):', error);
    }
  }

  private formatEntry(entry: DateEntry): string | null {
    if (!entry || entry.month == null || entry.day == null) {
      return null;
    }
    const month = this.pad2(entry.month);
    const day = this.pad2(entry.day);
    return `${month}-${day}`;
  }

  private pad2(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
