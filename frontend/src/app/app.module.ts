
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';
import { SignUpComponent } from './features/register/register.component';
import { NavbarComponent } from './features/navbar/navbar.component';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PaginationComponent } from './features/pagination/pagination.component';
import { FileUploadComponent } from './features/file-upload/file-upload.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [AppComponent, LoginComponent, SignUpComponent,  DashboardComponent, PaginationComponent,NavbarComponent,FileUploadComponent],
  imports: [BrowserModule, ReactiveFormsModule, HttpClientModule, AppRoutingModule,FormsModule],
  providers: [  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true 
  }, AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
