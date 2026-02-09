import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

interface UserPayload {
  cid: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  async getUsers(): Promise<UserPayload[]> {
    return firstValueFrom(this.http.get<UserPayload[]>(`${this.apiUrl}/users`));
  }

  async saveUser(user: UserPayload): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.apiUrl}/user`, user));
  }
}
