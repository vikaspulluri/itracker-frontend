import { Component, OnInit } from '@angular/core';
import { AppHttpService } from '../shared/app-http.service';
import { UtilService } from '../shared/util.service';
import { UsersResponse, ProjectsResponse } from '../shared/response.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NgForm } from '@angular/forms';
import { config } from '../app.config';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss', '../../styles/_foundation-theme.scss']
})
export class ProjectsComponent implements OnInit {

  public user;
  public users;
  public projects = [];
  public currentPage = config.customPagination.currentPage;
  public itemsPerPage = config.customPagination.itemsPerPage;
  public itemsPerPageOptions = config.customPagination.itemsPerPageOptions;
  public totalReqCount = 2; // all server requests happened in this component
  public completedReqCount = 0;
  constructor(private httpService: AppHttpService,
            private utilService: UtilService,
            private loaderService: NgxUiLoaderService) { }

  ngOnInit() {
    this.getAllUsers();
    this.getProjects('', ['*']);
  }

  getAllUsers() {
    this.loaderService.start();
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      this.completedReqCount++;
      this.users = this.utilService.mapUserDataToForm(response.data);
      this.users.unshift({value: '*', display: 'All'});
      this.stopProgressBar();
    }, err => this.loaderService.stop());
  }

  getProjects(title: string, users: string[]) {
    this.loaderService.start();
    this.httpService.getProjects({title: title, users: users}).subscribe((response: ProjectsResponse) => {
      this.completedReqCount++;
      this.projects = response.data;
      this.stopProgressBar();
    }, err => this.loaderService.stop());
  }

  stopProgressBar() {
    if (this.completedReqCount >= this.totalReqCount) {
      this.loaderService.stop();
    }
    return true;
  }

  onFiltersSubmit(form: NgForm) {
    let title = form.value.projectSearch;
    let users = (form.value.users && form.value.users.length > 0) ? form.value.users.map(user => user.value) : ['*'];
    console.log(users);
    this.getProjects(title, users);
  }

}
