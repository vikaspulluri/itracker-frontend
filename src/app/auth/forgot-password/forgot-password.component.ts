import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public email;
  constructor(private loaderService: NgxUiLoaderService,
    private router: Router, private authService: AuthService,
    private toastrService: ToastrService) { }

  ngOnInit() {
  }
  onFormSubmit() {
    if (typeof this.email === 'undefined' || this.email === '') {
      return;
    }
    this.loaderService.start();
    this.authService.requestPassword(this.email).subscribe(response => {
      this.email = '';
      this.loaderService.stop();
      this.router.navigate(['/reset-password']).then(() => this.toastrService.success(response.message));
    }, err => this.loaderService.stop());
  }
}
