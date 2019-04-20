import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private toastr: ToastrService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errMsg = 'Something went wrong, please try again later!!!';
        let errType = 'UnknownError';
        if (error.error.message) {
          errMsg = error.error.message;
        }
        if (error.error.errorType) {
          errType = error.error.errorType;
        }
        this.toastr.error(errMsg, errType);
        return throwError(error);
      })
    );
  }
}
