import 'rxjs/add/operator/switchMap';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginProviderService } from '../core/login-provider.service';
import { moveIn } from '../router.animations';
import { FormControl, Validators } from '@angular/forms';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /^.{6,}$/;

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class SignupComponent {
    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(EMAIL_REGEX)]);

    passwordFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(PASSWORD_REGEX)]);

    repeatPasswordFormControl = new FormControl('', []);

    constructor(private loginProvider: LoginProviderService,
        private router: Router) {
    }

    googleLogin() {
        this.loginProvider.googleLogin();
        this.navigateToDashboard();
    }

    facebookLogin() {
        this.loginProvider.facebookLogin();
        this.navigateToDashboard();
    }

    createLogin() {
        this.loginProvider.signup(this.emailFormControl.value, this.passwordFormControl.value);
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
