import 'rxjs/add/operator/switchMap';

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';


interface User {
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
    constructor(private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private router: Router) {
        afs.firestore.settings({ timestampsInSnapshots: true });
        //// Get auth data, then get firestore user document || null
        this.user = this.afAuth.authState
            .switchMap(user => {
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
                    return Observable.of(null);
                }
            });
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
        this.emailAuthLogin(email, password);
    }

    signup(email: string, password: string) {
        this.signupWithEmail(email, password);
    }

    private signupWithEmail(email: string, password: string) {
        return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
            .then((credential) => {
                this.updateUserData(credential);
            });
    }

    private emailAuthLogin(email: string, password: string) {
        return this.afAuth.auth.signInWithEmailAndPassword(email, password)
            .then((credential) => {
                this.updateUserData(credential.user);
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
            role: ''
        };

        this.afs.firestore.doc(`/users/${user.uid}`).get()
            .then(docSnapshot => {
                if (docSnapshot.exists) {
                    return userRef.update(data);
                } else {
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
