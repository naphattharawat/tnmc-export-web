import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface HistoryDetail {
  [key: string]: any;
}

export interface HistoryLog {
  [key: string]: any;
}

export interface HistoryItem {
  log?: HistoryLog;
  state_name?: string;
  details?: HistoryDetail[];
  [key: string]: any;
}

interface HistoryResponse {
  ok: boolean;
  data?: HistoryItem[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getHistory(): Promise<HistoryItem[]> {
    const response = await firstValueFrom(
      this.http.get<HistoryResponse>(`${this.apiUrl}/history`)
    );
    if (!response?.ok) {
      return [];
    }
    return Array.isArray(response.data) ? response.data : [];
  }
}
