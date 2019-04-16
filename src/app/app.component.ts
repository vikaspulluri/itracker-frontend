import { Component, OnInit } from '@angular/core';
import { UtilService } from './shared/util.service';
import { SubscriptionService } from './shared/subscription.service';
import { AuthService } from './auth/shared/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [UtilService, SubscriptionService]
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.autoAuthUser();
  }
}
