import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../forgot-password/forgot-password.component.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public isInvalidConfirmPassword = false;
  constructor(private loaderService: NgxUiLoaderService,
      private authService: AuthService,
      private router: Router,
      private toastrService: ToastrService) { }

  ngOnInit() {
  }
  onFormSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.loaderService.start();
    const data = {
      verificationCode: form.value.verificationCode,
      newPassword: form.value.password
    };
    this.authService.resetPassword(data).subscribe(response => {
      this.loaderService.stop();
      form.reset();
      if (response.error === false) {
        this.router.navigate(['/login']).then(() => this.toastrService.success(response.message));
      }
    }, err => this.loaderService.stop());
  }

  onConfirmPasswordEntry(password, cpassword) {
    if (password !== cpassword) {
      this.isInvalidConfirmPassword = true;
      return;
    } else {
      this.isInvalidConfirmPassword = false;
    }
  }
}
