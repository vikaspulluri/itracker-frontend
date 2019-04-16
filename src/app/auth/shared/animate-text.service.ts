import { Injectable, Inject, Optional } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AnimateTextService {
    counter: number;
    period: number;
    txt: string;
    isDeleting: boolean;
    private itemsToRotate = ['iTracker'];
    element: HTMLElement;
    private timeout;
    constructor(
        @Inject(DOCUMENT) private document: HTMLDocument) {
    }

    initiate() {
        this.counter = 0;
        this.element = document.querySelector('span.title');
        this.period = 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    }

    tick() {
        // tslint:disable-next-line:prefer-const
        let i = this.counter % this.itemsToRotate.length;
        // tslint:disable-next-line:prefer-const
        let fullTxt = this.itemsToRotate[i];

        if (this.isDeleting) {
            this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
            this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.element.innerHTML = this.txt;

        let delta = 220 - Math.random() * 100;
        if (this.isDeleting) {delta = delta / 2; }
        if (!this.isDeleting && this.txt === fullTxt) {
            delta = this.period;
            this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
            this.isDeleting = false;
            this.counter++;
            delta = 500;
        }

        this.timeout = setTimeout(() => {
            this.tick();
        }, delta);
    }

    clearTime() {
        clearTimeout(this.timeout);
    }
}
