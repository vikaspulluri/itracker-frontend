import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AnimateTextService } from '../shared/animate-text.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {

  public screenWidth = window.outerWidth;
  constructor(private animateTextService: AnimateTextService) { }

  ngOnInit() {
    if (this.screenWidth > 767) {
      this.animateTextService.initiate();
    } else {
      this.animateTextService.clearTime();
    }
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.screenWidth = window.innerWidth;
  }

  ngOnDestroy() {
    this.animateTextService.clearTime();
  }

}
