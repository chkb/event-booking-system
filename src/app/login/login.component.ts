import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from '../../../node_modules/rxjs';
import { LoginProviderService } from '../core/login-provider.service';
import { moveIn } from '../router.animations';


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
export class LoginComponent implements OnDestroy {
    private subcribtion: Subscription;
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
        this.navigateToList();
    }

    facebookLogin() {
        this.loginProvider.facebookLogin();
        this.navigateToList();
    }

    emailLogin(email: string, password: string) {
        this.loginProvider.emailLogin(email, password);
        this.navigateToList();
    }

    navigateToList(): void {
        this.subcribtion = this.loginProvider.user.subscribe(res => {
            if (res && res.uid) {
                if (this.isAdmin()) {
                    this.gotoEventList();
                } else if (this.isEventLeader()) {
                    this.gotoPayoutList();
                } else {
                    this.gotoDashboard();
                }
            }
        });
    }

    isEventLeader() {
        if (this.loginProvider.role === 'eventLeader') {
            return true;
        }

        return false;
    }

    isAdmin() {
        if (this.loginProvider.role === 'admin') {
            return true;
        }

        return false;
    }

    gotoEventList(): void {
        this.router.navigate([`/event/list`]);
    }

    gotoPayoutList(): void {
        this.router.navigate([`/payout/list`]);
    }

    gotoDashboard(): void {
        this.router.navigate([`/dashboard`]);
    }

    ngOnDestroy(): void {
        if (this.subcribtion) {
            this.subcribtion.unsubscribe();
        }
    }
}
