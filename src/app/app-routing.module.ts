import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
import { AuthGuard } from './auth/auth.guard';
import { ProjectFormComponent } from './projects/project-form/project-form.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
  {path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard]},
  {path: 'project/:id', component: ProjectComponent, canActivate: [AuthGuard]},
  {path: 'issues', component: IssuesComponent, canActivate: [AuthGuard]},
  {path: 'issue/:id', component: IssueComponent, canActivate: [AuthGuard]},
  {path: 'issue-form', component: IssueFormComponent, canActivate: [AuthGuard]},
  {path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard]},
  {path: 'statistics/:userId', component: StatisticsComponent, canActivate: [AuthGuard]},
  {path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard]},
  {path: 'project-form', component: ProjectFormComponent, canActivate: [AuthGuard]},
  {path: 'overview', component: OverviewComponent},
  {path: 'contact-us', component: ContactUsComponent, canActivate: [AuthGuard]},
  {path: 'not-found', component: PageNotFoundComponent},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path: '**', redirectTo: '/not-found'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
