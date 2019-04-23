import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SocketService } from 'src/app/shared/socket.service';
import { Router } from '@angular/router';
import { LoginResponse } from '../shared/user.model';

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


  ngAfterViewInit() {
    this.authService.googleInit();
  }

}
