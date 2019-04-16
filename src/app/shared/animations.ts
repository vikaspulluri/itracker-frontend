import { trigger, transition, style, animate, state } from '@angular/animations';

export const fadeOut = trigger('fadeInOut', [
    state('true', style({
      opacity: 1,
      display: 'block'
    })),
    state('false', style({
      opacity: 0,
      display: 'none'
    })),
    transition('true => false', [
      animate('1s')
    ])
]);

export const fadeIn = trigger('fadeIn', [
    state('false', style({
        opacity: 0,
        display: 'none'
    })),
    state('true', style({
        opacity: 1,
        display: 'block'
    })),
    transition('true => false', [
        animate('1s')
    ]),
]);
