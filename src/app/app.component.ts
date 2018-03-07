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
        public auth: LoginProviderService) {
        this.auth.user.subscribe(res => {
            if (res && res.uid) {
                this.isAuthenticated = true;
            } else {
                this.isAuthenticated = false;
            }
        });
    }

    dashboardItems: NavigationItem[] = [
        {
            url: '/dashboard',
            text: 'Dashboard'
        }
    ];

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

    skillNavigationItems: NavigationItem[] = [
        {
            url: '/skills',
            text: 'Kompetencer'
        }
    ];


    logout(): void {
        this.auth.signOut();
    }
}
