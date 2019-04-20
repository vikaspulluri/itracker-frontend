import { NgxUiLoaderConfig } from 'ngx-ui-loader';
import { NgxGalleryAnimation, NgxGalleryOptions } from 'ngx-gallery';

export const progressBarConfig: NgxUiLoaderConfig = {
    'bgsColor': '#00ACC1',
    'bgsOpacity': 0.5,
    'bgsPosition': 'bottom-right',
    'bgsSize': 60,
    'bgsType': 'ball-spin-clockwise',
    'blur': 0,
    'fgsColor': '#FF69B4',
    'fgsPosition': 'top-right',
    'fgsSize': 40,
    'fgsType': 'three-strings',
    'gap': 24,
    'logoPosition': 'center-center',
    'logoSize': 120,
    'logoUrl': '',
    'masterLoaderId': 'master',
    'overlayBorderRadius': '0',
    'overlayColor': 'transparent',
    'pbColor': '#FF69B4',
    'pbDirection': 'ltr',
    'pbThickness': 8,
    'hasProgressBar': true,
    'text': '',
    'textColor': '#FFFFFF',
    'textPosition': 'center-center',
    'threshold': 500
};

export const toastrConfig = {
    timeOut: 8000,
    extendedTimeOut: 2000,
    closeButton: true,
    preventDuplicates: true,
    maxOpened: 4,
    toastClass: 'custom-toast toast',
    positionClass: 'toast-top-center'
};

export const textEditorConfig = {
    theme: 'royal',
    charCounterCount: false,
    heightMin: 200,
    heightMax: 300,
    placeholder: 'Add Description about the issue',
    toolbarButtons: ['undo', 'redo' , '|', 'bold', 'italic', 'underline',
                        'strikeThrough', 'subscript', 'superscript', 'outdent',
                        'indent', 'clearFormatting', 'insertTable', 'html',
                        'emoticons', 'codeBeautifier'
                    ],
    toolbarButtonsXS: ['undo', 'redo' , '-', 'bold', 'italic', 'underline', 'emoticons'],
    contenteditable: true,
    events: {}
};

export const galleryConfig: NgxGalleryOptions[] = [{ 'image': false, 'height': '100px', imageAnimation: NgxGalleryAnimation.Slide },
{ 'breakpoint': 500, 'width': '100%' }];

