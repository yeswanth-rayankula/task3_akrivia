

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { SignUpComponent } from './features/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignUpComponent },
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
