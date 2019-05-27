import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Wager } from '../shared/wager';
import { moveIn } from '../router.animations';

@Component({
    selector: 'app-wager',
    templateUrl: './wager.component.html',
    styleUrls: ['./wager.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class WagerComponent implements OnInit {
    wager = new Wager();
    wagerList: Wager[] = [];
    namer: string;
    value: string;
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
        this.wagerList = [];
        this.afs.collection('wagers').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterSkill = new Wager();
                masterSkill.name = doc.data()['name'];
                masterSkill.value = doc.data()['value'];
                masterSkill.uid = doc.id;
                this.wagerList.push(masterSkill);
            });
        });
    }

    create(): void {
        this.wagerList.push(this.wager);
        this.afs.collection('wagers').add(JSON.parse(JSON.stringify(this.wager))).then(res => {
            this.snackBar.open('Løn-niveau oprettet', 'LUK',
                {
                    duration: 10000,
                });
            this.wager = new Wager();
        });
    }

    delete(wager: Wager, value: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af løn-niveau, er du sikker på du vil slette denne løn-niveau? \n
                    Vær opmærksom på at dette løn-niveau stadig vil fremgå på de medarbejder der har den tildelt.`,
                    title: `Vil du slette ${wager.name} løn-niveau`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET LØN-NIVEAU'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.removeInPlace(this.wagerList, wager);
                this.afs.collection('wagers')
                    .doc(wager.uid)
                    .delete()
                    .then(res => {
                        this.snackBar.open('Løn-niveau slettet', 'LUK',
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
