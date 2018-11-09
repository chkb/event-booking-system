import { switchMap } from 'rxjs/operators';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginProviderService } from '../core/login-provider.service';
import { moveIn } from '../router.animations';
import { FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const PASSWORD_REGEX = /^.{6,}$/;

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.css'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class ForgotComponent {
    email: string;
    validation: boolean;
    wrong: boolean;

    constructor(private afAuth: AngularFireAuth) {
    }

    isValid(): boolean {
        let result = false;
        if (!this.email || !EMAIL_REGEX.test(this.email)) {
            result = true;
        }
        return result;
    }

    sendMail() {
        this.afAuth.auth.sendPasswordResetEmail(this.email)
            .then(() => {
                this.validation = true;
                this.wrong = false;
            }).catch(() => {
                this.wrong = true;
            });
    }
}
