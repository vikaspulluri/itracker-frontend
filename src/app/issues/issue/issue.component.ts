import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from '../../shared/util.service';
import { AppHttpService } from 'src/app/shared/app-http.service';
import { IssueDetailsResponse, UsersResponse } from 'src/app/shared/response.interface';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { Issue, Comment } from 'src/app/shared/models';
import { textEditorConfig, galleryConfig } from 'src/app/shared/libraries.config';
import { AuthService } from 'src/app/auth/shared/auth.service';
import {  NgxGalleryImage } from 'ngx-gallery';
import { config } from '../../app.config';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.scss', '../../../styles/_foundation-theme.scss']
})
export class IssueComponent implements OnInit {

  public users;
  public user;
  public issueId;
  public labels;
  public issueDetails: Issue;
  public issueDuration; // holds duration of issue in active state
  public textEditorConfig = Object.assign({}, textEditorConfig);
  public commentConfig = Object.assign({}, textEditorConfig);
  public currentUserId = this.authService.getUserId();
  public currentUserName = this.authService.getUsername();
  public galleryOptions = galleryConfig;
  public galleryImages: NgxGalleryImage[];
  public statusGroup = config.filtersForm.issueGroup.slice();
  public priorityGroup = config.filtersForm.priorityGroup.slice();
  public isAssigneeEditing = false; // will be updated when user clicks on edit icon beside assignee
  public issueComment; // two way binding with comment editor
  public allComments; // holds all comments of issue
  public attachmentPreview; // attachment thumbnail
  public isTitleEditing = false; // will be updated when user clicks on edit icon beside title
  public backupTitle;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private utilService: UtilService,
    private httpService: AppHttpService,
    private loaderService: NgxUiLoaderService,
    private toastrService: ToastrService,
    private authService: AuthService) {
      this.commentConfig.heightMin = 150;
  }

  ngOnInit() {
    this.loaderService.start();
    this.statusGroup.shift(); // no need to keep 'All' in issue status form
    this.priorityGroup.shift();
    this.route.paramMap.subscribe(params => {
      // need to get project details from id
      this.issueId = params.get('id');
      if (this.issueId && typeof this.issueId !== 'undefined') {
        this.getIssueById();
      } else {
        this.router.navigate(['/issues']);
      }
    });
    this.getAllUsers();
    this.getAllLabels();
  }

  // ############################################################################### //
  // *************************** MAIN METHODS ************************************* //
  // ############################################################################## //
  getIssueById() {
    this.httpService.getIssueById(this.issueId).subscribe((response: IssueDetailsResponse) => {
      this.getComments();
      this.issueDetails = {
        issueId: response.data.issueId,
        title: response.data.title,
        assignee: response.data.assignee,
        formAssignee: this.utilService.mapUserDataToForm([response.data.assignee]),
        reporter: response.data.reporter,
        status: response.data.status,
        priority: response.data.priority,
        project: response.data.project,
        description: response.data.description,
        watchers: response.data.watchers,
        formWatchers: this.utilService.mapUserDataToForm(response.data.watchers),
        labels: response.data.labels,
        imageUrl: response.data.imageUrl,
        createdDate: this.utilService.formatDate(response.data.createdDate),
        lastModifiedOn: this.utilService.formatDate(response.data.lastModifiedOn),
        activity: response.data.activity.map(obj => {
          obj.readableDate = this.utilService.formatDate(new Date(obj.dateLog).toISOString());
          return obj;
        }).reverse()
      };
      this.updatePrivilieges();
      if (this.issueDetails.completionDate) {
        this.issueDuration = this.utilService.getDuration(response.data.createdDate, response.data.completionDate);
      } else {
        this.issueDuration = this.utilService.getDuration(response.data.createdDate, null);
      }
      if (this.issueDetails.imageUrl) {
        this.galleryImages = [{medium: this.issueDetails.imageUrl, small: this.issueDetails.imageUrl, big: this.issueDetails.imageUrl}];
      }
      this.loaderService.stop();
    }, err => this.router.navigate(['/not-found']));
  }

  getComments() {
    this.httpService.getComments(this.issueId).subscribe(response => {
      this.allComments = response.data.map(comment => {
        comment.createdDate = this.utilService.formatDate(comment.createdDate);
        return comment;
      });
    });
  }

  getAllUsers() {
    this.httpService.getAllUsers().subscribe((response: UsersResponse) => {
      this.users = this.utilService.mapUserDataToForm(response.data);
    }, err => this.loaderService.stop());
  }

  getAllLabels() {
    this.httpService.getAllLabels().subscribe((response: {message: string, error: boolean, data: string[]}) => {
      this.labels = response.data.map(label => {
        let obj = {
          display: label,
          value: label
        };
        return obj;
      });
    }, err => this.loaderService.stop());
  }


  // ############################################################################### //
  // ************************* USER INTERACTION METHODS **************************** //
  // ############################################################################## //

  onUpdateAssignee($event, isSaveBtn = false) {
    if ($event) {
      this.issueDetails.formAssignee[0].display = $event.display;
      this.issueDetails.formAssignee[0].value = $event.value;
    }
    if (isSaveBtn) {
      this.isAssigneeEditing = false;
      // check if the assignee is changed, if not return
      if (this.issueDetails.assignee.userId === this.issueDetails.formAssignee[0].value) {
        return;
      }
      this.issueDetails.assignee.userId = this.issueDetails.formAssignee[0].value;
      let assigneeName = this.issueDetails.formAssignee[0].display.split(' ');
      this.issueDetails.assignee.firstName = assigneeName[0];
      this.issueDetails.assignee.lastName = assigneeName[1];

      // update issue with assignee
      this.loaderService.start();
      this.httpService.updateIssue(this.issueDetails.issueId, 'assignee', this.issueDetails.assignee).subscribe(response => {
        this.toastrService.success(response.message);
        this.loaderService.stop();
        const defaultMsg = '*** has updated the assignee for ###';
        // realtime message to watchers
        const receivers = this.getNotificationReceivers();
        this.utilService.sendNotification(defaultMsg, 'issue',
                        {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers, 'high');
        this.updateIssueActivity(this.issueDetails.issueId, `${this.authService.getUsername()} updated assignee`);
      }, err => this.loaderService.stop());

      // need to update watchers list also since new assignee here
      let currentWatchers = this.issueDetails.formWatchers || [];
      let currentAssignee = Object.assign({}, this.issueDetails.formAssignee[0]);
      let isAssigneeAlreadyWatching = currentWatchers.find(user => user.value === currentAssignee.value);
      if (!isAssigneeAlreadyWatching) {
        currentAssignee.readonly = true;
        this.onAddWatcher(currentAssignee);
      } else {
        isAssigneeAlreadyWatching.readonly = true;
      }
    }
  }

  onCancelUpdateAssignee() {
    this.isAssigneeEditing = false;
    this.issueDetails.formAssignee[0].display = this.issueDetails.assignee.firstName + ' ' + this.issueDetails.assignee.lastName;
    this.issueDetails.formAssignee[0].value = this.issueDetails.assignee.userId;
  }


  onAddWatcher($event, selfWatching = false) {
    this.loaderService.start();
    let currentWatchers = this.issueDetails.formWatchers || [];
    let updatedWatchersTagFormat = [$event, ...currentWatchers];
    let updatedWatchers = this.utilService.unmapUserDataFromForm(updatedWatchersTagFormat);
    this.httpService.updateIssue(this.issueDetails.issueId, 'watchers', updatedWatchers).subscribe(response => {
      this.loaderService.stop();
      this.issueDetails.formWatchers = updatedWatchersTagFormat;
      this.issueDetails.watchers = this.utilService.unmapUserDataFromForm(this.issueDetails.formWatchers);
      let defaultMsg = '*** has added new watcher to ###';
      let activityMsg = `${this.authService.getUsername()} added new watcher`;
      if (selfWatching) {
        defaultMsg = '*** has started watching the ###';
        activityMsg = `${this.authService.getUsername()} started watching this issue`;
      }
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers);
      this.updateIssueActivity(this.issueDetails.issueId, activityMsg);
    }, err => this.loaderService.stop());
  }

  onRemoveWatcher($event, selfWatching = false) {
    let userId = $event.value;
    let index = this.issueDetails.formWatchers.findIndex(user => user.value === userId);
    if (index > -1) {
      this.loaderService.start();
      this.issueDetails.formWatchers.splice(index, 1);
      let updatedUsers = this.utilService.unmapUserDataFromForm(this.issueDetails.formWatchers);
      this.httpService.updateIssue(this.issueId, 'watchers', updatedUsers).subscribe(response => {
        this.loaderService.stop();
        this.issueDetails.watchers = updatedUsers;
        let defaultMsg = '*** has removed a watcher from ###';
        let activityMsg = `${this.authService.getUsername()} removed a watcher`;
        if (selfWatching) {
          defaultMsg = '*** has stopped watching the ###';
          activityMsg = `${this.authService.getUsername()} stopped watching this issue`;
        }
        // realtime message to watchers
        const receivers = this.getNotificationReceivers();
        this.utilService.sendNotification(defaultMsg, 'issue',
                        {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers);
        this.updateIssueActivity(this.issueDetails.issueId, activityMsg);
      }, error => this.loaderService.stop());
    } else {
      this.loaderService.stop();
    }
  }

  onAddLabel($event) {
    this.loaderService.start();
    let currentLabels = this.issueDetails.labels || [];
    let updatedLabels = [$event.value, ...currentLabels];
    this.httpService.updateIssue(this.issueId, 'labels', updatedLabels).subscribe(response => {
      this.loaderService.stop();
      this.issueDetails.labels = updatedLabels;
      const defaultMsg = '*** has added new label to ###';
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers);
      this.updateIssueActivity(this.issueDetails.issueId, `${this.authService.getUsername()} added new label`);
    }, err => this.loaderService.stop());
  }

  onRemoveLabel($event) {
    this.loaderService.start();
    let currentLabels = this.issueDetails.labels || [];
    let updatedLabel = $event;
    let index = currentLabels.findIndex(label => label === updatedLabel);
    if (index > -1) {
      this.issueDetails.labels.splice(index, 1);
      this.httpService.updateIssue(this.issueId, 'labels', this.issueDetails.labels).subscribe(response => {
        this.loaderService.stop();
        const defaultMsg = '*** has removed a label from ###';
        // realtime message to watchers
        const receivers = this.getNotificationReceivers();
        this.utilService.sendNotification(defaultMsg, 'issue',
                        {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers);
        this.updateIssueActivity(this.issueDetails.issueId, `${this.authService.getUsername()} removed a label`);
      }, err => this.loaderService.stop());
    } else {
      this.loaderService.stop();
    }
  }

  onPriorityChange($event) {
    this.loaderService.start();
    this.issueDetails.priority = $event.target.value;
    this.httpService.updateIssue(this.issueDetails.issueId, 'priority', this.issueDetails.priority).subscribe(response => {
      this.loaderService.stop();
      const defaultMsg = `*** has updated priority to ${this.issueDetails.priority} for ###`;
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers, 'high');
      this.updateIssueActivity(this.issueDetails.issueId,
        `${this.authService.getUsername()} updated priority to ${this.issueDetails.priority}`);
  }, err => this.loaderService.stop());
  }

  onStatusChange($event) {
    this.loaderService.start();
    this.issueDetails.status = $event.target.value;
    this.httpService.updateIssue(this.issueDetails.issueId, 'status', this.issueDetails.status).subscribe(response => {
      this.loaderService.stop();
      const defaultMsg = `*** has updated status to ${this.issueDetails.status} for ###`;
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers, 'high');
      this.updateIssueActivity(this.issueDetails.issueId,
          `${this.authService.getUsername()} updated status to ${this.issueDetails.status}`);
    }, err => this.loaderService.stop());
  }

  onUpdateIssueDescription() {
    this.loaderService.start();
    let updatedDescription = this.issueDetails.description;
    updatedDescription = this.utilService.removeCharsFromString(updatedDescription, 'Powered by');
    this.httpService.updateIssue(this.issueId, 'description', updatedDescription).subscribe(response => {
      this.loaderService.stop();
      this.toastrService.success(response.message);
      const defaultMsg = `*** has updated description to ${this.issueDetails.description} for ###`;
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers, 'high');
      this.updateIssueActivity(this.issueDetails.issueId,
          `${this.authService.getUsername()} has updated the description`);
    }, err => this.loaderService.stop());
  }

  onAddComment() {
    let summary = this.utilService.removeCharsFromString(this.issueComment, 'Powered by');
    if (!summary) { return; }
    this.loaderService.start();
    let comment: Comment = {
      issueId: this.issueId,
      summary: summary,
      userName: this.currentUserName,
      userId: this.currentUserId
    };
    this.httpService.addComment(comment).subscribe(response => {
      this.loaderService.stop();
      comment.createdDate = this.utilService.formatDate(new Date().toISOString());
      this.allComments.unshift(comment);
      this.issueComment = '';
    }, err => this.loaderService.stop());
  }

  onEditTitleIcon() {
    this.isTitleEditing = true;
    this.backupTitle = this.issueDetails.title;
  }

  onUpdateTitle() {
    if (this.issueDetails.title === '' || typeof this.issueDetails.title === 'undefined') {
      return;
    }
    if (this.issueDetails.title && this.issueDetails.title.length < 3) {
      this.toastrService.error('Title should have minimum 3 characters!!!');
      return;
    }
    this.loaderService.start();
    this.httpService.updateIssue(this.issueId, 'title', this.issueDetails.title).subscribe(response => {
      this.loaderService.stop();
      this.isTitleEditing = false;
      const defaultMsg = `*** has updated title to ${this.issueDetails.title} for ###`;
      // realtime message to watchers
      const receivers = this.getNotificationReceivers();
      this.utilService.sendNotification(defaultMsg, 'issue',
                      {id: this.issueDetails.issueId, title: this.issueDetails.title}, receivers, 'high');
      this.updateIssueActivity(this.issueDetails.issueId,
          `${this.authService.getUsername()} updated the title to ${this.issueDetails.title}`);
    }, err => this.loaderService.stop());
  }

  onCancelUpdateTitle() {
    this.issueDetails.title = this.backupTitle;
    this.isTitleEditing = false;
  }


  // ############################################################################### //
  // *************************** UTILITY METHODS *********************************** //
  // ############################################################################## //
  getNotificationReceivers() {
    return [...this.issueDetails.watchers];
  }

  updateIssueActivity(issueId, msg: string) {
    let date = this.utilService.getCurrentDate();
    // update issue activity
    this.utilService.updateActivity(issueId, msg);
    this.issueDetails.activity.unshift({
      summary: msg,
      dateLog: date,
      readableDate: this.utilService.formatDate(date.toISOString())
    });
  }

  updatePrivilieges() {
    if (!this.isReporter()) {
      this.textEditorConfig.contenteditable = false;
      this.textEditorConfig.events = {
        'froalaEditor.initialized': function(e, editor) {
          editor.edit.off();
        }
      };
    }
    let updatedWatchers = this.issueDetails.formWatchers.map(watcher => {
      if (watcher.value === this.issueDetails.reporter.userId ||
          watcher.value === this.issueDetails.assignee.userId) {
            watcher.readonly = true;
      }
      return watcher;
    });
    this.issueDetails.formWatchers = updatedWatchers;
  }

  isAssignee() {
    if (this.issueDetails && this.issueDetails.assignee) {
      // tslint:disable-next-line:max-line-length
      return this.currentUserId === this.issueDetails.assignee.userId;
    }
    return false;
  }

  isReporter() {
    if (this.issueDetails && this.issueDetails.reporter) {
      return this.currentUserId === this.issueDetails.reporter.userId;
    }
    return false;
  }

  isWatcher() {
    if (this.issueDetails && this.issueDetails.watchers) {
      let findUser = this.issueDetails.watchers.find(user => user.userId === this.currentUserId);
      return true ? (findUser && findUser.userId) : false;
    }
    return false;
  }

  isOutSideUser() {
    return !(this.isAssignee() || this.isReporter() || this.isWatcher());
  }

}
