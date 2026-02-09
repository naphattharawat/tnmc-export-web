import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { DateEntry } from '../models/date-entry';

@Injectable({
  providedIn: 'root'
})
export class DatesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getDates(): Promise<DateEntry[]> {
    return firstValueFrom(this.http.get<DateEntry[]>(`${this.apiUrl}/dates`));
  }

  async saveDates(dates: DateEntry[]): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.apiUrl}/dates`,  dates ));
  }
}
