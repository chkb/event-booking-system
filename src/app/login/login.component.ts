import 'rxjs/add/operator/switchMap';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginProviderService } from '../core/login-provider.service';
import { moveIn } from '../router.animations';
import { trigger, transition, style, state, animate } from '@angular/animations';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    animations: [moveIn(),
    trigger('active', [
        state('inactive', style({
            transform: 'scale(0.6)'
        })),
        state('active', style({
            transform: 'scale(1.0)'
        })),
        transition('inactive => active', animate('1000ms ease-in')),
        transition('active => inactive', animate('1000ms ease-out'))
    ])],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class LoginComponent {
    lockstate = 'inactive';
    constructor(private loginProvider: LoginProviderService,
        private router: Router) {
        this.toggleLock();
    }

    toggleLock(): void {
        setInterval(() => {
            this.lockstate = this.lockstate === 'active' ? 'inactive' : 'active';
        }, 2000);
    }

    googleLogin() {
        this.loginProvider.googleLogin();
        this.navigateToDashboard();
    }

    facebookLogin() {
        this.loginProvider.facebookLogin();
        this.navigateToDashboard();
    }

    emailLogin(email: string, password: string) {
        this.loginProvider.emailLogin(email, password);
        this.navigateToDashboard();
    }

    navigateToDashboard(): void {
        this.loginProvider.user.subscribe(res => {
            if (res && res.uid) {
                this.router.navigate(['/dashboard']);
            }
        });
    }
}
