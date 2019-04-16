import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, AuthInfo, LoginResponse, SignUpResponse } from './user.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../shared/socket.service';

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

  constructor(private http: HttpClient, private router: Router, private toastrService: ToastrService,
    private socketService: SocketService) {}

  getToken() {
    return this.token;
  }

  getUsername() {
    return this.username || '';
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

  setAuthInfo(response: LoginResponse) {
    const expiresInDuration = response.data.expiryDuration;
    this.token = response.data.token;
    this.isAuthenticated = true;
    this.username = response.data.username;
    this.userId = response.data.userId;
    this.loginCount = response.data.loginCount;
    this.setAuthTimer(expiresInDuration);
    const now = new Date();
    const expiration = new Date(now.getTime() + expiresInDuration * 1000);
    this.saveAuthData(this.token, expiration, response.data.userId, response.data.username, this.loginCount);
    this.authStatusListener.next(true);
  }

  createUser(user: User) {
    return this.http.post<SignUpResponse>(`${this.config.apiUrl}/api/user/create`, user);
  }
  login(email: string, password: string) {
    const authData: AuthInfo = {email: email, password: password};
    return this.http.post<LoginResponse>(`${this.config.apiUrl}/api/user/login`, authData);
  }
  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.userId = null;
    this.socketService.disconnectSocket(this.getToken());
    this.router.navigate(['/']);
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
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
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.socketService.setWatcher();
    }
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, username: string, loginCount: number) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
    localStorage.setItem('loginCount', '' + loginCount);
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
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const loginCount = localStorage.getItem('loginCount');
    if (!token || !expiration) {
      return;
    }
    return {
      token: token,
      expiration: new Date(expiration),
      userId: userId,
      username: username,
      loginCount: loginCount
    };
  }

  public requestPassword(email: String) {
    return this.http.post<{error: boolean, message: string}>(`${this.config.apiUrl}/api/user/request-password`, {email: email});
  }

  public resetPassword(data: {verificationCode: string, newPassword: string}) {
    return this.http.post<{error: boolean, message: string}>(`${this.config.apiUrl}/api/user/reset-password`, data);
  }
}
