import { Component, OnInit, AfterViewChecked, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SocketService } from 'src/app/shared/socket.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../shared/user.model';
import { authConfig } from '../auth.config';

declare const gapi: any;
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit, AfterViewInit  {
  isPageLoaded = false;
  public auth2: any;
  constructor(private authService: AuthService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private socketService: SocketService,
    private router: Router) { }

  ngOnInit() {
  }

  onLogin(form: NgForm) {
    if (form.invalid) { return; }
    this.loaderService.start();
    this.authService.login(form.value.email, form.value.password).subscribe((response: LoginResponse) => {
      if (response && response.data) {
        this.toastrService.success(response.message);
        this.authService.setAuthInfo(response);
        const userData = {
          authToken: this.authService.getToken(),
        };
        this.socketService.setUser(userData);
        this.socketService.setWatcher();
        this.router.navigate(['/dashboard']);
      }
    }, err => this.loaderService.stop());
  }

  /** Social Login */
  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init(authConfig.googleAuthConfig);
      this.attachSignin(document.getElementById('google-btn'));
    });
  }
  public attachSignin(element) {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {

        let profile = googleUser.getBasicProfile();
        console.log('Token || ' + googleUser.getAuthResponse().id_token);
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());

      }, (error) => {
        alert(JSON.stringify(error, undefined, 2));
      });
  }

  ngAfterViewInit() {
        this.googleInit();
  }

}
