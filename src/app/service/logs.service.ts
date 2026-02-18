import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface LogsResponse {
  ok: boolean;
  lines?: string[];
  code?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LogsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getLogs(): Promise<string[]> {
    const response = await firstValueFrom(
      this.http.get<LogsResponse>(`${this.apiUrl}/exports/logs`)
    );
    if (!response?.ok) return [];
    return Array.isArray(response.lines) ? response.lines : [];
  }
}
