import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
// tslint:disable-next-line:import-blacklist
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
    role?: string;
}

@Injectable()
export class LoginProviderService {
    user: Observable<User>;
    userId: string;
    role: string;
    constructor(
        private afAuth: AngularFireAuth,
        private snackBar: MatSnackBar,
        private afs: AngularFirestore,
        private router: Router,

    ) {
        //// Get auth data, then get firestore user document || null
        this.user = this.afAuth.authState.pipe(
            switchMap(user => {
                if (user) {
                    this.userId = user.uid;
                    const _user = this.afs.doc<User>(`users/${user.uid}`).valueChanges();
                    // tslint:disable-next-line:no-shadowed-variable
                    _user.subscribe((user: User) => {
                        if (user) {
                            this.role = user.role;
                        }
                    });

                    return _user;
                } else {
                    return of(null);
                }
            })
        );
    }

    googleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider();
        return this.oAuthLogin(provider);
    }

    facebookLogin() {
        const provider = new firebase.auth.FacebookAuthProvider();
        return this.oAuthLogin(provider);
    }

    emailLogin(email: string, password: string) {
        return this.emailAuthLogin(email, password);
    }

    signup(email: string, password: string) {
        this.signupWithEmail(email, password);
    }

    private signupWithEmail(email: string, password: string) {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                this.snackBar.open('Bruger er nu oprettet.',
                    'LUK',
                    {
                        duration: 10000,
                    });
                this.router.navigate(['/login-email']);
            })
            .catch(error => {
                this.snackBar.open(error, 'LUK',
                    {
                        duration: 10000,
                    });
            });
    }

    private emailAuthLogin(email: string, password: string) {
        this.afAuth.auth.signInWithEmailAndPassword(email, password)
            .then((result) => {
                this.updateUserData(result.user);
            })
            .catch(error => {
                this.snackBar.open(error, 'LUK',
                    {
                        duration: 10000,
                    });
            });
    }

    private oAuthLogin(provider) {
        return this.afAuth.auth.signInWithPopup(provider)
            .then((credential) => {
                this.updateUserData(credential.user);
            });
    }

    private updateUserData(user) {
        // Sets user data to firestore on login
        const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
        const data: User = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
        };

        this.afs.firestore.doc(`/users/${user.uid}`).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    return userRef.update(data);
                } else {
                    data.role = '';
                    return userRef.set(data);
                }
            });
    }

    signOut() {
        this.afAuth.auth.signOut().then(() => {
            this.router.navigate(['/login']);
        });
    }
}
