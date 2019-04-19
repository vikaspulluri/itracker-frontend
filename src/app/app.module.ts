// core libraries
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // this is needed!
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// 3rd party libraries
import { TagInputModule } from 'ngx-chips'; // tag inputs
import { AngularFontAwesomeModule } from 'angular-font-awesome'; // font icons
import { NgxUiLoaderModule } from 'ngx-ui-loader'; // progress bar
import { NgxPaginationModule } from 'ngx-pagination'; // pagination module
import { ToastrModule } from 'ngx-toastr'; // toastr module
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg'; // rich text editor
import { NgxGalleryModule } from 'ngx-gallery'; // attachment gallery in issue details page

// App feature modules
import { AuthModule } from './auth/auth.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ErrorInterceptor } from './auth/error.interceptor';

// components
import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsComponent } from './projects/projects.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ProjectComponent } from './projects/project/project.component';
import { IssuesComponent } from './issues/issues.component';
import { IssueComponent } from './issues/issue/issue.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { IssueFormComponent } from './issues/issue-form/issue-form.component';
import { OverviewComponent } from './overview/overview.component';
import { ProjectFormComponent } from './projects/project-form/project-form.component';

// services
import { SocketService } from './shared/socket.service';

// config
import { progressBarConfig, toastrConfig } from './shared/libraries.config';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    DashboardComponent,
    ProjectsComponent,
    StatisticsComponent,
    ProjectComponent,
    IssuesComponent,
    IssueComponent,
    ContactUsComponent,
    NotificationsComponent,
    IssueFormComponent,
    OverviewComponent,
    ProjectFormComponent,
    PageNotFoundComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    AppRoutingModule,
    AngularFontAwesomeModule,
    TagInputModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxPaginationModule,
    NgxUiLoaderModule.forRoot(progressBarConfig),
    ToastrModule.forRoot(toastrConfig),
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
    NgxGalleryModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
              {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
              SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
