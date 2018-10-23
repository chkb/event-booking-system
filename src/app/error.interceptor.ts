import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private snackbar: MatSnackBar) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            tap(res => { }, (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    // if (err.status === 403) {
                    // Vis besked a la "du har ikke rettighed til at tilgå...."
                    // }
                    this.snackbar.open(err.message, 'LUK', {
                        duration: 10000
                    });
                }
            })
        );
    }
}
