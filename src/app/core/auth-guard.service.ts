import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';

import { LoginProviderService } from './login-provider.service';
import { take, map, tap } from 'rxjs/operators';

// tslint:disable-next-line:import-blacklist
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private auth: LoginProviderService, private router: Router) { }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | boolean {
        return this.auth.user.pipe(
            take(1),
            map(user => !!user),
            tap(loggedIn => {
                if (!loggedIn) {
                    console.log('access denied');
                    this.router.navigate(['/login']);
                }
            })
        );
    }
}
