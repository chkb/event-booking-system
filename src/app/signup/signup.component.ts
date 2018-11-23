import { switchMap } from 'rxjs/operators';

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
    email: string;
    password: string;
    repeatPassword: string;
    validation: string;

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

    isValid(): boolean {
        let result = false;
        if (this.password !== this.repeatPassword) {
            result = false;
        } else if (!this.email || !EMAIL_REGEX.test(this.email)) {
            result = false;
        } else if (this.password.length < 6) {
            result = false;
        } else {
            result = true;
        }

        return result;
    }

    createLogin() {
        if (this.isValid()) {
            this.loginProvider.signup(this.email, this.password);
            this.navigateToDashboard();
        }
    }

    navigateToDashboard(): void {
        this.loginProvider.user.subscribe(res => {
            if (res && res.uid) {
                this.router.navigate(['/dashboard']);
            }
        });
    }
}
