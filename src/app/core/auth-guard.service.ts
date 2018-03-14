import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { LoginProviderService } from './login-provider.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: LoginProviderService, private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.user
            .take(1)
            .map(user => !!user)
            .do(loggedIn => {
                if (!loggedIn) {
                    console.log('access denied');
                    this.router.navigate(['/login']);
                }
            });
    }
}
