import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';

import { config } from '../app.config';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AppHttpService } from '../shared/app-http.service';
import { UsersResponse, ProjectsResponse, FilteredIssuesResponse } from '../shared/response.interface';
import { UtilService } from '../shared/util.service';
import { AuthService } from '../auth/shared/auth.service';
import { format } from 'url';

@Component({
  selector: 'app-issues',
  templateUrl: './issues.component.html',
  styleUrls: ['./issues.component.scss']
})
export class IssuesComponent implements OnInit {

  public filtersFormConfig = config.filtersForm;
  public activeUserId;
  public activePriority = this.filtersFormConfig.priorityGroup[0].value;
  public activeProjectId$;
  public activeIssueType$ = this.filtersFormConfig.issueGroup[0].value;
  public activeLabel$ = this.filtersFormConfig.labelGroup[0].value;
  public users;
  public projects;
  public currentUserId = this.authService.getUserId();
  public serverCallsCount = 3; // getProjects, getUsers, getLabels
  public completedServerCallsCount = 0;
  public isinitialPageLoad = true;
  public issues = [];
  public labels = [];
  public hasOpenIssues;
  public searchTitle; // two way data binding with search bar value
  public currentPage = config.customPagination.currentPage;
  public itemsPerPage = config.customPagination.itemsPerPage;
  public itemsPerPageOptions = config.customPagination.itemsPerPageOptions;
  private isAscending = true;
  public activeSortColumn;
  public tableColumns = [...config.issueTableColumns, {key: 'status', value: 'Status'}];

  filtersForm = new FormGroup({
    userGroup: new FormGroup({
      userId: new FormControl(this.activeUserId)
    }),
    issueGroup: new FormGroup({
      issueType: new FormControl(this.activeIssueType$)
    }),
    priorityGroup: new FormGroup({
      priority: new FormControl(this.activePriority)
    }),
    projectGroup: new FormGroup({
      projectId: new FormControl(this.activeProjectId$)
    }),
    labelGroup: new FormGroup({
      label: new FormControl(this.activeLabel$)
    })
  });

  constructor(private route: ActivatedRoute,
              private loaderService: NgxUiLoaderService,
              private httpService: AppHttpService,
              private utilService: UtilService,
              private authService: AuthService) {}
  ngOnInit() {
    this.loaderService.start();
    this.route.queryParamMap.subscribe(queryParams => {
      this.mapActivatedQueryParams(queryParams);
      this.getAllUsers();
      this.getProjects('', ['*']);
      this.getAllLabels();
    });
  }

  mapActivatedQueryParams(queryParams) {
    if (queryParams.has('projectId')) {
      let projectId = queryParams.get('projectId');
      this.activeProjectId$ = projectId;
      this.updateProjectGroup();
    }
    if (queryParams.has('userId')) {
      let userId = queryParams.get('userId');
      this.activeUserId = userId;
      this.updateUserGroup();
    }
    if (queryParams.has('issueType')) {
      let issueType = queryParams.get('issueType');
      let index = this.filtersFormConfig.issueGroup.findIndex(item => item.value === issueType);
      if (index && index > -1) {
        this.activeIssueType$ = this.filtersFormConfig.issueGroup[index].value;
        this.updateIssueGroup();
      }
    }

    if (queryParams.has('priority')) {
      let priority = queryParams.get('priority');
      let index = this.filtersFormConfig.priorityGroup.findIndex(item => item.value === priority);
      if (index && index > -1) {
        this.activePriority = this.filtersFormConfig.priorityGroup[index].value;
        this.updatePriorityGroup();
      }
    }
    if (queryParams.has('label')) {
      let label = queryParams.get('label');
      let index = this.filtersFormConfig.labelGroup.findIndex(item => item.value === label);
      if (index && index > -1) {
        this.activeLabel$ = this.filtersFormConfig.labelGroup[index].value;
        this.updateLabelGroup();
      }
    }
  }

  // function to update priorityGroup in filters
  updatePriorityGroup() {
    this.filtersForm.patchValue({
      priorityGroup: {
        priority: this.activePriority
      }
    });
  }

  // function to update labelGroup in filters
  updateLabelGroup() {
    this.filtersForm.patchValue({
      labelGroup: {
        label: this.activeLabel$
      }
    });
  }

  // function to update issueGroup in filters
  updateIssueGroup() {
    this.filtersForm.patchValue({
      issueGroup: {
        issueType: this.activeIssueType$
      }
    });
  }

  // function to update projectGroup in filters
  updateProjectGroup() {
    this.filtersForm.patchValue({
      projectGroup: {
        projectId: this.activeProjectId$
      }
    });
  }

  updateUserGroup() {
    this.filtersForm.patchValue({
      userGroup: {
        userId: this.activeUserId
      }
    });
  }

  getAllUsers() {
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      this.completedServerCallsCount++;
      this.users = this.utilService.mapUserDataToForm(response.data);
      this.users.push(this.filtersFormConfig.userGroup[0]);
      this.activeUserId = this.activeUserId || this.currentUserId;
      this.updateUserGroup();
      if (this.completedServerCallsCount >= this.serverCallsCount && this.isinitialPageLoad) {
        this.isinitialPageLoad = false;
        this.getFilteredIssues();
        this.loaderService.stop();
      }
    }, err => this.loaderService.stop());
  }

  getProjects(title: string, users: string[]) {
    this.httpService.getProjects({title: title, users: users}).subscribe((response: ProjectsResponse) => {
      this.completedServerCallsCount++;
      let formattedProjects = this.utilService.mapProjectDataToForm(response.data);
      this.projects = [...this.filtersFormConfig.projectGroup, ...formattedProjects];
      this.activeProjectId$ = this.activeProjectId$ || this.projects[0].value;
      this.updateProjectGroup();
      if (this.completedServerCallsCount >= this.serverCallsCount && this.isinitialPageLoad) {
        this.isinitialPageLoad = false;
        this.getFilteredIssues();
        this.loaderService.stop();
      }
    }, err => this.loaderService.stop());
  }

  getAllLabels() {
    this.httpService.getAllLabels().subscribe((response: {message: string, error: boolean, data: string[]}) => {
      this.completedServerCallsCount++;
      this.labels = response.data.map(label => {
        let obj = {
          name: label,
          value: label
        };
        return obj;
      });
      this.labels.unshift(this.filtersFormConfig.labelGroup[0]);
      if (this.completedServerCallsCount >= this.serverCallsCount && this.isinitialPageLoad) {
        this.isinitialPageLoad = false;
        this.getFilteredIssues();
        this.loaderService.stop();
      }
    }, err => this.loaderService.stop());
  }

  getFilteredIssues() {
    this.loaderService.start();
    let formControls = this.filtersForm.controls;
    let userGroup = formControls.userGroup;
    let priorityGroup = formControls.priorityGroup;
    let issueGroup = formControls.issueGroup;
    let projectGroup = formControls.projectGroup;
    let labelGroup = formControls.labelGroup;
    let userId = userGroup.get('userId').value === 'all' ? null : userGroup.get('userId').value;
    let filters = {
      userId: userId,
      projectId: projectGroup.get('projectId').value,
      issueType: issueGroup.get('issueType').value,
      priority: priorityGroup.get('priority').value,
      label: labelGroup.get('label').value,
      title: this.searchTitle
    };
    this.httpService.getIssues(filters).subscribe((response: FilteredIssuesResponse) => {
      this.issues = response.data.map(issue => {
        issue.createdDate = this.utilService.formatDate(issue.createdDate, 'dateOnly');
        issue.status = this.utilService.mapReadableStatusName(issue.status);
        return issue;
      });
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  onUpdateFilters() {
    this.getFilteredIssues();
  }

  onSortIconClick(property: string, subProperty?: string) {
    this.activeSortColumn = property;
    this.isAscending = !this.isAscending;
    this.issues = this.utilService.sortArrayByKey(this.issues, this.activeSortColumn, this.isAscending, subProperty);
  }


}
