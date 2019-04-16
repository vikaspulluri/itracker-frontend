import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/shared/util.service';
import { AuthService } from '../auth/shared/auth.service';
import { AppHttpService } from '../shared/app-http.service';
import { ContribProjects, IssueStatsResponse } from '../shared/response.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss', '../../styles/_foundation-theme.scss']
})
export class StatisticsComponent implements OnInit {

  public userId$;
  public userName;
  public userShortName$;
  public contributions = [];
  public issueStats: {totalIssues: number, qa: number, progress: number, done: number, backlog: number};
  public currentUserId = this.authService.getUserId();
  constructor(private route: ActivatedRoute,
    private router: Router,
    private utilService: UtilService,
    private authService: AuthService,
    private httpService: AppHttpService,
    private loaderService: NgxUiLoaderService) {

  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      // need to get project details from userId
      this.userId$ = params.get('userId') || this.currentUserId;
      this.getUserContributions();
      this.getIssueStats();
    });
  }

  getUserContributions() {
    this.loaderService.start();
    this.httpService.getUserContibProjects(this.userId$).subscribe((response: ContribProjects) => {
      this.userName = response.data.firstName + ' ' + response.data.lastName;
      this.userShortName$ = this.utilService.getShortName(this.userName, 2);
      this.contributions = response.data.projectDetails;
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  getIssueStats() {
    this.loaderService.start();
    this.httpService.getIssueStats({userId: this.userId$}).subscribe((response: IssueStatsResponse) => {
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

}
