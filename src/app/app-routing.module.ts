import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './layout/layout.component';
import { HistoryComponent } from './history/history.component';
import { LoginComponent } from './login/login.component';
import { SettingComponent } from './setting/setting.component';
import { UserComponent } from './user/user.component';
import { ThaidCallbackComponent } from './thaid-callback/thaid-callback.component';
import { LogsComponent } from './logs/logs.component';
import { CheckauthGuard } from './guard/checkauth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'callback/thaid', component: ThaidCallbackComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    canActivateChild: [CheckauthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'setting', component: SettingComponent },
      { path: 'user', component: UserComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
