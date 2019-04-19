import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../forgot-password/forgot-password.component.scss', './reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  public isInvalidConfirmPassword = false;
  constructor() { }

  ngOnInit() {
  }
  onConfirmPasswordEntry(password: string, confirmPassword: string) {}
  onFormSubmit(form: NgForm) {}
}
