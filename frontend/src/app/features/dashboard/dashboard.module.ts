import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';

import { DashboardRoutingModule } from './dashboard.routing';

@NgModule({
  declarations: [
    DashboardComponent,
    NavbarComponent,
    PaginationComponent,
    FileUploadComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
