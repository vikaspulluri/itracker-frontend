import { Component, OnInit } from '@angular/core';
import { AppHttpService } from '../shared/app-http.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { config } from '../app.config';
import { UtilService } from '../shared/util.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

  public notifications;
  private currentPage = config.customPagination.currentPage;
  private itemsPerPage = config.customPagination.itemsPerPage;
  private itemsPerPageOptions = config.customPagination.itemsPerPageOptions;
  public isNotificationsFetched = false;
  public status = [
    {title: 'Unread', value: 'unread'},
    {title: 'Read', value: 'read'},
    {title: 'All', value: null}
  ];
  public priority = [
    {title: 'High', value: 'high'},
    {title: 'Low', value: 'low'},
    {title: 'All', value: null}
  ];
  public activeStatus;
  public activePriority;
  constructor(private appHttpService: AppHttpService,
              private loaderService: NgxUiLoaderService,
              private utilService: UtilService,
              private toastrService: ToastrService) { }

  ngOnInit() {
    this.activeStatus = this.status[0].value;
    this.activePriority = this.priority[0].value;
    this.getAllNotifications();
  }

  getAllNotifications() {
    this.loaderService.start();
    this.appHttpService.getUserNotifications(this.activeStatus, this.activePriority).subscribe(response => {
      this.isNotificationsFetched = true;
      if (response.data) {
        this.notifications = response.data.map(notification => {
          notification.message = notification.message.replace('***', '');
          notification.message = notification.message.replace('###', '');
          let date = notification.createdDate || null;
          notification.createdDate = this.utilService.formatDate(new Date(date).toISOString());
          return notification;
        });
      } else {
        this.notifications = null;
      }
      this.loaderService.stop();
    }, err => {
      this.isNotificationsFetched = true;
      this.loaderService.stop();
    });
  }

  onPriorityChange($event) {
    this.activePriority = $event.target.value;
    this.getAllNotifications();
  }

  onStatusChange($event) {
    this.activeStatus = $event.target.value;
    this.getAllNotifications();
  }

  onClearAllNotifications() {
    this.updateNotification();
  }

  updateNotification(data?: {criteria: string, notificationId: string} ) {
    this.loaderService.start();
    this.appHttpService.updateNotification(data).subscribe(response => {
      this.toastrService.success(response.message);
      this.activeStatus = this.status[0].value;
      this.getAllNotifications();
      this.loaderService.stop();
    }, err => this.loaderService.stop());
  }

}
