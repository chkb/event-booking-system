import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Message } from '../../shared/message';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LoginProviderService } from '../../core/login-provider.service';
import { Employee } from '../../shared/employee';
import { moveIn } from '../../router.animations';

interface User {
    uid: string;
    email: string;
    photoURL?: string;
    displayName?: string;
    favoriteColor?: string;
    role?: string;
}

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class MessagesAdminComponent implements OnInit {
    message = new Message();
    messagesList: Message[] = [];
    namer: string;
    value: string;
    user: User;
    constructor(
        private afs: AngularFirestore,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private auth: LoginProviderService
    ) {

    }

    ngOnInit() {
        this.getData();
        this.auth.user.subscribe(user => {
            this.user = user;
        });
    }

    getData(): void {
        this.messagesList = [];
        this.afs.collection('messages').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const message = new Message();
                message.title = doc.data()['title'];
                message.dateCreated = doc.data()['dateCreated'];
                message.message = doc.data()['message'];
                message.createdByName = doc.data()['createdByName'];
                message.createdByImage = doc.data()['createdByImage'];
                message.employeeList = doc.data()['employeeList'];
                message.uid = doc.id;
                this.messagesList.push(message);
            });
            this.messagesList.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
        });
    }

    create(): void {
        this.message.createdByName = this.user.displayName;
        this.message.createdByImage = this.user.photoURL;
        this.message.dateCreated = new Date();
        this.messagesList.push(this.message);
        this.afs.collection('messages').add(JSON.parse(JSON.stringify(this.message))).then(res => {
            this.snackBar.open('Besked oprettet', 'LUK',
                {
                    duration: 10000,
                });
            this.message = new Message();
        });
    }

    delete(messages: Message): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af beskeden, er du sikker på du vil slette denne besked?`,
                    title: `Vil du slette ${messages.title} beskeden`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET BESKED'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.removeInPlace(this.messagesList, messages);
                this.afs.collection('messages')
                    .doc(messages.uid)
                    .delete()
                    .then(res => {
                        this.snackBar.open('Besked slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                    });
            }
        });
    }

    removeInPlace(array, item) {
        let foundIndex, fromIndex;

        // Look for the item (the item can have multiple indices)
        fromIndex = array.length - 1;
        foundIndex = array.lastIndexOf(item, fromIndex);

        while (foundIndex !== -1) {
            // Remove the item (in place)
            array.splice(foundIndex, 1);

            // Bookkeeping
            fromIndex = foundIndex - 1;
            foundIndex = array.lastIndexOf(item, fromIndex);
        }

        // Return the modified array
        return array;
    }

}
