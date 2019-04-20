import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthService } from '../auth/shared/auth.service';
import { SocketService } from '../shared/socket.service';
import { SubscriptionService } from '../shared/subscription.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  username: string;
  constructor(private authService: AuthService,
              private subscriptionService: SubscriptionService) { }

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.subscriptionService.receiveNotification();
  }

  onLogout() {
    this.authService.logout();
  }

}
