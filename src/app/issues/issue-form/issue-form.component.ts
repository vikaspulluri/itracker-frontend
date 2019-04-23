import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from './mime-type.validator';
import { textEditorConfig } from '../../shared/libraries.config';
import { AuthService } from 'src/app/auth/shared/auth.service';
import { AppHttpService } from 'src/app/shared/app-http.service';
import { UtilService } from 'src/app/shared/util.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UsersResponse, ProjectsResponse } from 'src/app/shared/response.interface';
import { Issue } from 'src/app/shared/models';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from 'src/app/shared/socket.service';
@Component({
  selector: 'app-issue-form',
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.scss', '../../../styles/_foundation-theme.scss']
})
export class IssueFormComponent implements OnInit {

  public mode = 'create'; // by default it's a create form unless there is a query param
  public issueId = null; // value incase of mode = edit
  public attachmentPreview; // attachment thumbnail
  public issueForm: FormGroup;
  public users; // placeholder holds all users
  public projects; // placeholder holds all projects
  public project; // active project
  public labels = []; // holds all labels
  public label; // holds active labels
  public reporter; // active reporter
  public watcher; // active watcher
  public assignee; // active assignee
  public textEditorConfig = Object.assign({}, textEditorConfig);
  public currentUserId = this.authService.getUserId();
  constructor(private authService: AuthService,
              private httpService: AppHttpService,
              private utilService: UtilService,
              private loaderService: NgxUiLoaderService,
              private router: Router,
              private toastrService: ToastrService,
              private socketService: SocketService) {
  }

  ngOnInit() {
    this.initializeForm();
    this.getAllUsers();
    this.getProjects('', ['*']);
  }

  // initialize form on pageload
  initializeForm() {
    this.issueForm = new FormGroup({
      title: new FormControl(null, {validators: [Validators.required, Validators.minLength(3)]}),
      description: new FormControl(null, {validators: [Validators.required]}),
      attachment: new FormControl(null, {asyncValidators: [mimeType]}),
      priority: new FormControl('medium', {validators: [Validators.required]}),
      project: new FormControl(null, {validators: [Validators.required]}),
      reporter: new FormControl(null, {validators: [Validators.required]}),
      assignee: new FormControl(null, {validators: [Validators.required]}),
      watchers: new FormControl(null, {validators: [Validators.required]}),
      labels: new FormControl(null)
    });
  }

  getAllUsers() {
    this.loaderService.start();
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      this.users = this.utilService.mapUserDataToForm(response.data);
      let currentUserIndex = this.users.findIndex(user => user.value === this.currentUserId);
      if (currentUserIndex > -1 && this.mode === 'create') {
        // by default add assignee to current user
        this.updateFormValue('assignee', this.users[currentUserIndex], true);
        // by default reporter is always creator with write access false
        let currentUser = Object.create(this.users[currentUserIndex]);
        currentUser.readonly = true;
        this.updateFormValue('reporter', currentUser, true);

        // update watchers
        this.updateFormValue('watchers', currentUser, true);
      }
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  getProjects(title: string, users: string[]) {
    this.loaderService.start();
    this.httpService.getProjects({title: title, users: users}).subscribe((response: ProjectsResponse) => {
      this.projects = this.utilService.mapProjectDataToForm(response.data);
      if (this.mode === 'create') {
        this.updateFormValue('project', this.projects[0], true);
      }
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

  onImagePicked($event: Event) {
    const file = ($event.target as HTMLInputElement).files[0];
    this.issueForm.patchValue({attachment: file});
    this.issueForm.get('attachment').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = (e) => {
      this.attachmentPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  updateFormValue(formControlName: string, value: any, isAutoTag = false) {
    let obj = {};
    if (isAutoTag === true) {
      obj[formControlName] = [value];
    } else {
      obj[formControlName] = value;
    }
    this.issueForm.patchValue(obj);
  }

  onFormSubmit() {
    // tslint:disable-next-line:forin
    for (let control in this.issueForm.controls) {
      if (this.issueForm.controls[control].errors) {
        return;
      }
    }
    this.loaderService.start();
    let issue: Issue = {
      title: this.issueForm.value.title,
      description: this.utilService.removeCharsFromString(this.issueForm.value.description, 'Powered by'),
      priority: this.issueForm.value.priority,
      project: {
        projectId: this.issueForm.value.project[0].value,
        title: this.issueForm.value.project[0].display
      },
      assignee: this.utilService.formatToSimpleUser(this.issueForm.value.assignee)[0],
      reporter: this.utilService.formatToSimpleUser(this.issueForm.value.reporter)[0],
      activity: [
        {summary: `${this.authService.getUsername()} created this issue`,
        dateLog: new Date()}
      ]
    };
    if (this.issueForm.get('attachment').value) {
      issue.attachment = this.issueForm.get('attachment').value;
    }
    if (this.issueForm.value.labels) {
      issue.labels = this.issueForm.value.labels.map(label => label.value);
    }
    if (this.issueForm.value.watchers) {
      issue.watchers = this.utilService.formatToSimpleUser(this.issueForm.value.watchers);
    }
    this.httpService.createIssue(issue).subscribe(response => {
      if (response.data && response.data.issueId) {
        this.socketService.setWatcher();
        let message = '*** has created an issue named ###';
        this.utilService.sendNotification(message, 'issue',
              {id: response.data.issueId, title: issue.title}, issue.watchers, 'high');
        this.router.navigate(['/issue', response.data.issueId]).then(success => this.toastrService.success(response.message));
      }
      this.loaderService.stop();
    }, err => {
      this.loaderService.stop();
    });
  }

  onAddAssignee($event) {
    let reporter = this.issueForm.value.reporter[0];
    if ($event.value === reporter.value) { return; } // if assignee is same as reporter and removed, do nothing to watchers
    let watchers = this.issueForm.value.watchers;
    let index = watchers.findIndex(user => user.value === $event.value);
    if (index < 0) {
      let newWatcher = Object.assign({}, $event);
      newWatcher.readonly = true;
      watchers.push(newWatcher);
      this.updateFormValue('watchers', watchers);
    }
  }

  onRemoveAssignee($event) {
    let reporter = this.issueForm.value.reporter[0];
    if ($event.value === reporter.value) { return; } // if assignee is same as reporter and removed, do nothing to watchers
    let watchers = this.issueForm.value.watchers;
    let index = watchers.findIndex(user => user.value === $event.value);
    if (index > -1) {
      watchers.splice(index, 1);
      this.updateFormValue('watchers', watchers);
    }
  }

}
