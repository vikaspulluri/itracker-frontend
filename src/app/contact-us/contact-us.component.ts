import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { config } from '../app.config';
import { AuthService } from '../auth/shared/auth.service';
import { textEditorConfig } from '../shared/libraries.config';
import { AppHttpService } from '../shared/app-http.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  public formQueryOptions = config.contactUsForm.queryGroup;
  public queries = this.formQueryOptions;
  public description;
  public query = this.queries[0].value;
  public textEditorConfig = Object.assign({}, textEditorConfig);
  constructor(private toastrService: ToastrService,
              private router: Router,
              private appHttpService: AppHttpService,
              private authService: AuthService,
              private loaderService: NgxUiLoaderService) { }

  ngOnInit() {
  }

  onContactFormSubmit(contactForm: NgForm) {
    if (contactForm.invalid) {
      return;
    }
    this.loaderService.start();
    let obj = {
      userName: this.authService.getUsername(),
      query: contactForm.value.query,
      description: contactForm.value.description
    };
    this.appHttpService.sendFeedback(obj).subscribe(response => {
      this.toastrService.success(response.message);
      this.loaderService.stop();
      contactForm.reset();
      this.query = this.queries[0].value;
    }, err => this.loaderService.stop());
  }

}
