import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  async process(): Promise<any> {
    const response = await firstValueFrom(this.http.get(`${this.apiUrl}/process`));
    return response;
  }
  async getState(): Promise<any> {
    const response = await firstValueFrom(this.http.get(`${this.apiUrl}/process/state`));
    return response;
  }

  async exportBirth(logId: string, token: string): Promise<Blob> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const response = await firstValueFrom(
      this.http.get(`${this.apiUrl}/exports/${logId}/birth`, { headers, responseType: 'blob' })
    );
    return response;
  }

  async exportDeath(logId: string, token: string): Promise<Blob> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const response = await firstValueFrom(
      this.http.get(`${this.apiUrl}/exports/${logId}/death`, { headers, responseType: 'blob' })
    );
    return response;
  }
}
