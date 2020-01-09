import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@app/_services';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt token if available
    let currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.id) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Bearer ${currentUser.accesstoken}`,
                },
                setParams : {
                    access_token : currentUser.id
                }
            });
        }

        return next.handle(request);
    }
}