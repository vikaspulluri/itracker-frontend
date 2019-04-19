import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }

  onHomeClick() {
    this.authService.getIsAuth() ? this.router.navigateByUrl('/dashboard') : this.router.navigateByUrl('/login');
  }

}
