import { Component, OnInit } from '@angular/core';
import { AppHttpService } from '../shared/app-http.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { config } from '../app.config';
import { UtilService } from '../shared/util.service';

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
  constructor(private appHttpService: AppHttpService,
              private loaderService: NgxUiLoaderService,
              private utilService: UtilService) { }

  ngOnInit() {
    this.loaderService.start();
    this.getAllNotifications();
  }

  getAllNotifications() {
    this.appHttpService.getUserNotifications(null, 'high').subscribe(response => {
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

}
