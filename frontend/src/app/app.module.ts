
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { SignUpComponent } from './features/register/register.component';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';



@NgModule({
  declarations: [AppComponent, LoginComponent, SignUpComponent, ForgetPasswordComponent, ResetPasswordComponent],
  imports: [BrowserModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule,FormsModule, BrowserAnimationsModule,
     ToastrModule.forRoot({
    timeOut: 2000, 
    positionClass: 'toast-top-right',
    preventDuplicates: true, 
  })],
  providers: [  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true ,
  }, AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
