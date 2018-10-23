import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MasterSkill } from '../shared/skill';
import { EventType } from '../shared/event-type';
import { moveIn } from '../router.animations';

@Component({
    selector: 'app-wager',
    templateUrl: './event-type.component.html',
    styleUrls: ['./event-type.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventTypeComponent implements OnInit {
    eventType = new EventType();
    eventTypeList: EventType[] = [];
    namer: string;
    value: string;

    colors =
        [
            {
                name: 'Blå', color: '#2195F2'
            },
            {
                name: 'Lilla', color: '#9B27AF'
            },
            {
                name: 'Rød', color: '#F44336'
            },
            {
                name: 'Grøn', color: '#4CAF50'
            },
            {
                name: 'Orange', color: '#FE5722'
            }
        ];
    constructor(
        private afs: AngularFirestore,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {

    }

    ngOnInit() {
        this.getData();
    }

    getData(): void {
        this.eventTypeList = [];
        this.afs.collection('event-types').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterSkill = new EventType();
                masterSkill.name = doc.data()['name'];
                masterSkill.color = doc.data()['color'];
                masterSkill.uid = doc.id;
                this.eventTypeList.push(masterSkill);
            });
        });
    }

    create(): void {
        this.eventTypeList.push(this.eventType);
        this.afs.collection('event-types').add(JSON.parse(JSON.stringify(this.eventType))).then(res => {
            this.snackBar.open('event-type oprettet', 'LUK',
                {
                    duration: 10000,
                });
            this.eventType = new EventType();
        });
    }

    delete(eventType: EventType, value: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af event-type, er du sikker på du vil slette denne event-type? \n
                    Vær opmærksom på at dette event-type stadig vil fremgå på de medarbejder der har den tildelt.`,
                    title: `Vil du slette ${eventType.name} event-type`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET EVENT-TYPE'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.removeInPlace(this.eventTypeList, eventType);
                this.afs.collection('event-types')
                    .doc(eventType.uid)
                    .delete()
                    .then(res => {
                        this.snackBar.open('Event-type slettet', 'LUK',
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

    getStyle(color: string): string {
        return `color:${color};`;
    }
}
