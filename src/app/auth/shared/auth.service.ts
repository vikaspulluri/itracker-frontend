import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, AuthInfo, LoginResponse, SignUpResponse } from './user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../shared/socket.service';
import { authConfig } from '../auth.config';
import { NgxUiLoaderService } from 'ngx-ui-loader';

declare const gapi: any;

@Injectable({providedIn: 'root'})
export class AuthService {
  private token;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: any;
  private userId;
  private username;
  private loginCount;
  private config = environment;
  private isSocialAuthUser: any;
  private auth2;

  constructor(private http: HttpClient, private router: Router, private toastrService: ToastrService,
    private socketService: SocketService, private ngZone: NgZone, private loaderService: NgxUiLoaderService) {}

  getToken() {
    return this.token;
  }

  getUsername() {
    return this.username || '';
  }

  getIsSocialAuthUser() {
    return this.isSocialAuthUser;
  }

  getUserFirstName() {
    if (typeof this.username !== 'undefined' || this.username !== '') {
      return this.username.split(' ')[0];
    }
    return '';
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  getLoginCount() {
    return parseInt(this.loginCount, 10) || 0;
  }

  /** Social Login */
  public googleInit() {
    gapi.load('auth2', () => {
      this.auth2 = gapi.auth2.init(authConfig.googleAuthConfig);
      const signInBtn = document.getElementById('google-btn');
      if (signInBtn) { this.attachGoogleAuthHandler(signInBtn); }
    });
  }
  public attachGoogleAuthHandler(element) {
    this.auth2.attachClickHandler(element, {},
      (googleUser) => {

        let profile = googleUser.getBasicProfile();
        let username = profile.getName().split(' ');
        let obj = {
          email: profile.getEmail(),
          firstName: username[0],
          lastName: username[1]
        };
        this.loaderService.start();
        this.socialLogin(obj).subscribe(response => {
          if (response && response.data) {
            this.ngZone.run(() => {
              this.loaderService.stop();
              this.toastrService.success(response.message);
              this.setAuthInfo(response);
              const userData = {
                authToken: this.getToken(),
              };
              this.socketService.setUser(userData);
              this.socketService.setWatcher();
              this.router.navigate(['/dashboard']);
            });
          }
          this.loaderService.stop();
        }, err => {
          this.loaderService.stop();
          console.log(err);
        });
      }, (error) => {
        console.log(JSON.stringify(error, undefined, 2));
      });
  }

  setAuthInfo(response: LoginResponse) {
    const expiresInDuration = response.data.expiryDuration;
    this.token = response.data.token;
    this.isAuthenticated = true;
    this.username = response.data.username;
    this.userId = response.data.userId;
    this.loginCount = response.data.loginCount;
    this.isSocialAuthUser = response.data.isSocialAuthUser;
    this.setAuthTimer(expiresInDuration);
    const now = new Date();
    const expiration = new Date(now.getTime() + expiresInDuration * 1000);
    this.saveAuthData(this.token, expiration, response.data.userId, response.data.username, this.loginCount, this.isSocialAuthUser);
    this.authStatusListener.next(true);
  }

  createUser(user: User) {
    return this.http.post<SignUpResponse>(`${this.config.apiUrl}/api/user/create`, user);
  }
  login(email: string, password: string) {
    const authData: AuthInfo = {email: email, password: password};
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/api/user/login`, authData);
  }
  socialLogin(data) {
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/api/user/social-login`, data);
  }
  logout() {
    // tslint:disable-next-line:triple-equals
    // if (this.getIsSocialAuthUser() == 'true') {
    //   gapi.auth2.getAuthInstance().auth2.signOut().then(() => console.log('signed out'));
    // }
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.socketService.disconnectSocket(this.getToken());
    this.ngZone.run(() => this.router.navigate(['/']));
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    this.googleInit();
    const userData = {authToken: authInfo.token};
    this.socketService.setUser(userData);
    const now = new Date();
    const expiresIn = authInfo.expiration.getTime() - now.getTime();
    if (expiresIn) {
      this.token = authInfo.token;
      this.isAuthenticated = true;
      this.userId = authInfo.userId;
      this.username = authInfo.username;
      this.loginCount = authInfo.loginCount;
      this.isSocialAuthUser = authInfo.isSocialAuthUser;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.socketService.setWatcher();
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string,
      username: string, loginCount: number, isSocialAuthUser: boolean) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('loginCount', '' + loginCount);
    localStorage.setItem('isSocialAuthUser', isSocialAuthUser.toString());
  }

  public updateAuthData(username: string) {
    localStorage.removeItem('username');
    localStorage.setItem('username', username);
    this.username = username;
    this.authStatusListener.next(true);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('loginCount');
    localStorage.removeItem('isSocialAuthUser');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const loginCount = localStorage.getItem('loginCount');
    const isSocialAuthUser = localStorage.getItem('isSocialAuthUser');
    if (!token || !expiration) {
      return;
    }
    return {
      token: token,
      expiration: new Date(expiration),
      userId: userId,
      username: username,
      loginCount: loginCount,
      isSocialAuthUser: isSocialAuthUser
    };
  }

  public requestPassword(email: String) {
    return this.http.post<{error: boolean, message: string}>(`${this.config.apiUrl}/api/user/request-password`, {email: email});
  }

  public resetPassword(data: {verificationCode: string, newPassword: string}) {
    return this.http.post<{error: boolean, message: string}>(`${this.config.apiUrl}/api/user/reset-password`, data);
  }
}
