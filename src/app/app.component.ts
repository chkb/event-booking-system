import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginProviderService } from './core/login-provider.service';

export class NavigationItem {
    url: string;
    text: string;
}
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    title = 'app';
    fullscreenActive = false;
    isAuthenticated: boolean;

    constructor(
        private router: Router,
        public auth: LoginProviderService
    ) {
        this.auth.user.subscribe(res => {
            if (res && res.uid) {
                this.isAuthenticated = true;
            } else {
                this.isAuthenticated = false;
            }
        });
    }

    eventNavigationItems: NavigationItem[] = [
        {
            url: '/event/list',
            text: 'Vis events'
        },
        {
            url: '/event/create',
            text: 'Opret event'
        },
    ];

    employeeNavigationItems: NavigationItem[] = [
        {
            url: '/employee/list',
            text: 'Vis medarbejdere'
        }
    ];

    dashboardNavigationItems: NavigationItem[] = [
        {
            url: '/dashboard',
            text: 'Dashboard'
        }
    ];

    skillNavigationItems: NavigationItem[] = [
        {
            url: '/skills',
            text: 'Kompetencer'
        }
    ];

    wagerNavigationItems: NavigationItem[] = [
        {
            url: '/wager',
            text: 'Løn-Niveauer'
        }
    ];

    eventTypeNavigationItems: NavigationItem[] = [
        {
            url: '/event-typer',
            text: 'Event-Typer'
        }
    ];

    payoutNavigationItems: NavigationItem[] = [
        {
            url: '/payout/list',
            text: 'Event lønning'
        }
    ];

    messagesNavigationItems: NavigationItem[] = [
        {
            url: '/messages/admin',
            text: 'Beskeder'
        }
    ];

    eventAdminNavigationItems: NavigationItem[] = [
        {
            url: '/payout-admin',
            text: 'Export løn data'
        }
    ];


    logout(): void {
        this.auth.signOut();
    }

    isAdminOrEventLeader() {
        if (this.auth.role === 'admin' || this.auth.role === 'eventLeader') {
            return true;
        }

        return false;
    }

    isEventLeader() {
        if (this.auth.role === 'eventLeader') {
            return true;
        }

        return false;
    }

    isAdmin() {
        if (this.auth.role === 'admin') {
            return true;
        }

        return false;
    }

    gotomyprofile(): void {
        this.router.navigate([`/employee`, this.auth.userId]);
    }
}
