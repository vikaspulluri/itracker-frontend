import { Component, OnInit } from '@angular/core';
import { UtilService } from '../shared/util.service';
import { SubscriptionService } from '../shared/subscription.service';
import { AuthService } from '../auth/shared/auth.service';
import { fadeOut } from '../shared/animations';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AppHttpService } from '../shared/app-http.service';
import { FilteredIssuesResponse } from '../shared/response.interface';
import { config } from '../app.config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    fadeOut
  ]
})
export class DashboardComponent implements OnInit {

  public greeting: string;
  public username: string;
  public userFirstName: string;
  public userId: string;
  public isRecommendationsPresent = false;
  public issues;
  public hasOpenIssues;
  public searchTitle; // two way data binding with search bar value
  private currentPage = config.customPagination.currentPage;
  private itemsPerPage = config.customPagination.itemsPerPage;
  private itemsPerPageOptions = config.customPagination.itemsPerPageOptions;
  private activeSortColumn;
  private isAscending = true;
  public tableColumns = config.issueTableColumns.slice();
  constructor(private utilService: UtilService,
    private subService: SubscriptionService,
    private authService: AuthService,
    private loaderService: NgxUiLoaderService,
    private httpService: AppHttpService) {
    this.greeting = this.utilService.getGreeting();
  }

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.userFirstName = this.authService.getUserFirstName();
    this.userId = this.authService.getUserId();
    this.setRecommendations();
    this.getOpenIssues();
  }

  setRecommendations() {
    this.isRecommendationsPresent = this.subService.getIsRecommendationsPresent();
  }

  getOpenIssues() {
    this.loaderService.start();
    let filters = {
      userId: this.userId,
      status: ['backlog', 'progress', 'qa'],
      title: this.searchTitle
    };
    this.httpService.getIssues(filters).subscribe((response: FilteredIssuesResponse) => {
      this.issues = response.data.map(issue => {
        issue.createdDate = this.utilService.formatDate(issue.createdDate, 'dateOnly');
        return issue;
      });
      // first time getting the issues for dashboard and setting the value
      if (typeof this.hasOpenIssues === 'undefined') {
        this.hasOpenIssues = this.issues.length > 0 ? true : false;
      }
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  onSortIconClick(property: string, subProperty?: string) {
    this.activeSortColumn = property;
    this.isAscending = !this.isAscending;
    this.issues = this.utilService.sortArrayByKey(this.issues, this.activeSortColumn, this.isAscending, subProperty);
  }

  onCancelRecommendations() {
    this.subService.clearRecommendations();
    this.setRecommendations();
  }

}
