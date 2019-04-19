import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { User, SignUpResponse } from '../shared/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['../sign-in/sign-in.component.scss', './sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  constructor(private authService: AuthService,
    private toastrService: ToastrService,
    private loaderService: NgxUiLoaderService,
    private router: Router) { }

  ngOnInit() {
  }

  onSignup(form: NgForm) {
    if (form.invalid) { return; }
    this.loaderService.start();
    const user: User = {
      firstName: form.value.firstname,
      lastName: form.value.lastname,
      email: form.value.email,
      password: form.value.password
    };
    this.authService.createUser(user).subscribe((response: SignUpResponse) => {
      if (response) {
        this.loaderService.stop();
        this.router.navigate(['/login']).then(() => {
          this.toastrService.success(response.message);
        });
      }
    }, err => this.loaderService.stop());
  }
}
