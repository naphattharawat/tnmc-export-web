import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginService } from '../service/login.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private loginService: LoginService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isApiRequest(req.url) || this.isAuthEndpoint(req.url) || req.headers.has('Authorization')) {
      return next.handle(req);
    }

    const token = this.loginService.getStoredToken();
    if (!token) {
      return next.handle(req);
    }

    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(authReq);
  }

  private isApiRequest(url: string): boolean {
    return url.startsWith(environment.apiUrl);
  }

  private isAuthEndpoint(url: string): boolean {
    return url.endsWith('/login') || url.endsWith('/thaid/callback');
  }
}
