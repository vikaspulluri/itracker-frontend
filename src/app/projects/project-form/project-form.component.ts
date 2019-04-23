import { Component, OnInit } from '@angular/core';
import { config } from '../../app.config';
import { NgForm } from '@angular/forms';
import { AppHttpService } from 'src/app/shared/app-http.service';
import { UsersResponse, ProjectResponse } from 'src/app/shared/response.interface';
import { UtilService } from 'src/app/shared/util.service';
import { Project } from 'src/app/shared/models';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss', '../../../styles/_foundation-theme.scss']
})
export class ProjectFormComponent implements OnInit {

  public users;
  public user;
  public projectTypes = config.projectTypes;
  public projectType;
  public currentUserId = this.authService.getUserId();
  public currentUserName = this.authService.getUsername();
  constructor(private httpService: AppHttpService,
            private utilService: UtilService,
            private authService: AuthService,
            private toastrService: ToastrService,
            private loaderService: NgxUiLoaderService,
            private router: Router) {
  }

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      let usersData = this.utilService.mapUserDataToForm(response.data);
      this.users = this.utilService.excludeCurrentUserFromInputTag(usersData);
    });
  }

  onProjectCreate(form: NgForm, event: Event) {
    event.preventDefault();
    if (form.invalid) {
      this.toastrService.error('All fields are required');
      return;
    }
    this.loaderService.start();
    const project: Project = {
      title: form.value.title,
      keyCode: this.utilService.getShortName(form.value.title).toUpperCase(),
      ownerId: this.currentUserId,
      ownerName: this.currentUserName,
      type: form.value.projectType[0].value,
      members: this.utilService.unmapUserDataFromForm(form.value.members)
    };
    this.httpService.createProject(project).subscribe((response: ProjectResponse) => {
      this.loaderService.stop();
      if (response && response.data) {
        this.router.navigate(['/project', response.data.projectId]).then(success => {
          this.toastrService.success(response.message);
        });
      }
    }, err => this.loaderService.stop());
  }

}
