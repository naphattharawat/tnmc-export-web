import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoading = false;
  thaidAuthUrl = environment.thaidAuthUrl;

  loginWithThaid(): void {
    if (!this.thaidAuthUrl) {
      console.error('THAID auth URL is not configured.');
      return;
    }
    this.isLoading = true;
    const clientId = 'MU9VN1luaUFTT1BaQmNGQlVxaTBQckNyVXVkdnVQc3g';
    const redirectUri = 'http://localhost:4200/callback/thaid';
    const state = Math.random().toString(36).substring(2);
    const url = `https://imauth.bora.dopa.go.th/api/v2/oauth2/auth/?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=pid&state=${state}`;
    window.location.href = url;
  }
}
