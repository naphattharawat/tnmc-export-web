import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ClarityModule } from "@clr/angular";
import { LayoutComponent } from './layout/layout.component';
import { SettingComponent } from './setting/setting.component';
import { UserComponent } from './user/user.component';
import { ThaidCallbackComponent } from './thaid-callback/thaid-callback.component';

import '@cds/core/icon/register.js';
import { ClarityIcons, userIcon, vmBugIcon, cloudIcon, folderIcon } from '@cds/core/icon';
import { HistoryComponent } from './history/history.component';
import { LogsComponent } from './logs/logs.component';
import { AuthInterceptor } from './interceptor/auth.interceptor';

ClarityIcons.addIcons(userIcon, vmBugIcon, cloudIcon, folderIcon);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    LayoutComponent,
    HistoryComponent,
    LogsComponent,
    SettingComponent,
    UserComponent,
    ThaidCallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ClarityModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
