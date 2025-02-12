import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CapitalizePipe } from './../../core/services/capitalize.pipe';
import { DashboardRoutingModule } from './dashboard.routing';
import { XlImportsComponent } from '../xl-imports/xl-imports.component';
import { ChatComponent } from '../chat/chat.component';
import { group } from 'console';
import { GroupChatComponent } from '../group-chat/group-chat.component';

@NgModule({
  declarations: [
    DashboardComponent,
    NavbarComponent,
    PaginationComponent,
    FileUploadComponent,
    CapitalizePipe,
    XlImportsComponent,
    ChatComponent,
    GroupChatComponent

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
