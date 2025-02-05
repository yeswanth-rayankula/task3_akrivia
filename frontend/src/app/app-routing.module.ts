

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { SignUpComponent } from './features/register/register.component';

import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignUpComponent },
  { path: 'forgetPassword', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { 
    path: 'dashboard',  
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule), 
    
  },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
