import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/shared/util.service';
import { AppHttpService } from 'src/app/shared/app-http.service';
import { UsersResponse, ProjectResponse, IssueStatsResponse, SimpleUser } from 'src/app/shared/response.interface';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Project } from 'src/app/shared/models';
import { AuthService } from 'src/app/auth/shared/auth.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss', '../../../styles/_foundation-theme.scss']
})
export class ProjectComponent implements OnInit {

  public users;
  public members;
  public projectId$;
  public projectShortName$;
  public activeProject: Project;
  public issueStats: {totalIssues: number, qa: number, progress: number, done: number, backlog: number};
  public currentUserId = this.authService.getUserId();
  public isOutSider = false;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private utilService: UtilService,
    private httpService: AppHttpService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private authService: AuthService) {
  }

  ngOnInit() {
    this.loaderService.start(); // starting on page load. finish it when all requests completed
    this.getAllUsers();
    this.route.paramMap.subscribe(params => {
      // need to get project details from id
      this.projectId$ = params.get('id');
      this.getProject(this.projectId$);
      this.getIssueStats();
    });
  }

  getAllUsers() {
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      let usersData = this.utilService.mapUserDataToForm(response.data);
      this.users = this.utilService.excludeCurrentUserFromInputTag(usersData);
    });
  }

  getProject(projectId: string) {
    this.httpService.getProject(projectId).subscribe((response: ProjectResponse) => {
      this.activeProject = response.data;
      this.projectShortName$ = this.utilService.getShortName(this.activeProject.title, 2);
      this.activeProject.createdDate = this.utilService.formatDate(response.data.createdDate);
      this.members = this.utilService.mapUserDataToForm(this.activeProject.members);
      this.members = this.utilService.setUserPrivilieges(this.activeProject.ownerId, this.members);
      this.isOutSider = !this.isMemberOfProject();
      this.loaderService.stop();
    }, err => {
      this.router.navigate(['/not-found']);
      return;
    });
  }

  isMemberOfProject() {
    let filteredArray = this.members.filter(member => member.value === this.currentUserId);
    return true ? (filteredArray.length > 0) || (this.currentUserId === this.activeProject.ownerId) : false;
  }

  onLeadClick() {
    this.router.navigate(['/statistics', this.activeProject.ownerId]);
  }

  getIssueStats() {
    this.loaderService.start();
    this.httpService.getIssueStats({projectId: this.projectId$}).subscribe((response: IssueStatsResponse) => {
      this.issueStats = {
        totalIssues: response.data.totalIssues || 0,
        backlog: response.data.issues.backlog || 0,
        qa: response.data.issues.qa || 0,
        progress: response.data.issues.progress || 0,
        done: response.data.issues.done || 0
      };
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  onAddMember($event) {
    this.loaderService.start();
    let username = $event.display;
    username = username.split(' ');
    let member: SimpleUser = {
      firstName: username[0],
      lastName: username[1],
      userId: $event.value
    };
    this.httpService.addMemberToProject(this.projectId$, member).subscribe(response => {
      this.loaderService.stop();
      this.toastrService.success(response.message);
    }, err => this.loaderService.stop());
  }

  onRemoveMember($event) {
    this.loaderService.start();
    let userId = $event.value;
    this.httpService.removeMemberFromProject(this.projectId$, userId).subscribe(response => {
      this.loaderService.stop();
      this.toastrService.success(response.message);
    }, err => this.loaderService.stop());
  }

}
