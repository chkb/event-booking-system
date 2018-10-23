import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginProviderService } from '../core/login-provider.service';
import { moveIn } from '../router.animations';



@Component({
    selector: 'app-login-email',
    templateUrl: './login-email.component.html',
    styleUrls: ['./login-email.component.css'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class LoginEmailComponent {
    email: string;
    password: string;

    constructor(private loginProvider: LoginProviderService,
        private router: Router) {
    }

    login() {
        this.loginProvider.emailLogin(this.email, this.password);
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
