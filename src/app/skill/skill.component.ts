import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MasterSkill } from '../shared/skill';
import { moveIn } from '../router.animations';

@Component({
    selector: 'app-skill',
    templateUrl: './skill.component.html',
    styleUrls: ['./skill.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class SkillComponent implements OnInit {
    masterSkill = new MasterSkill();
    masterskillList: MasterSkill[] = [];
    value: string;
    constructor(
        private afs: AngularFirestore,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.getData();
    }

    getData(): void {
        this.masterskillList = [];
        this.afs.collection('masterSkills').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterSkill = new MasterSkill();
                masterSkill.name = doc.data()['name'];
                masterSkill.onlyAdminEdit = doc.data()['onlyAdminEdit'];
                masterSkill.hasRating = doc.data()['hasRating'];
                masterSkill.skills = doc.data()['skills'];
                masterSkill.ratingValue1 = doc.data()['ratingValue1'];
                masterSkill.ratingValue2 = doc.data()['ratingValue2'];
                masterSkill.ratingValue3 = doc.data()['ratingValue3'];
                masterSkill.order = doc.data()['order'];
                masterSkill.uid = doc.id;
                this.masterskillList.push(masterSkill);
            });
            this.masterskillList.sort((a, b) => a.order - b.order);
        });
    }



    orderDown(masterSkill: MasterSkill): void {
        const idx1 = this.masterskillList.findIndex(x => x.order === masterSkill.order);
        const idx2 = this.masterskillList.findIndex(x => x.order === masterSkill.order + 1);
        this.masterskillList[idx2].order = masterSkill.order;
        this.masterskillList[idx1].order = masterSkill.order + 1;
        this.saveChanges(this.masterskillList[idx1]);
        this.saveChanges(this.masterskillList[idx2]);
        this.masterskillList.sort((a, b) => a.order - b.order);
    }

    orderUp(masterSkill: MasterSkill): void {
        const idx1 = this.masterskillList.findIndex(x => x.order === masterSkill.order);
        const idx2 = this.masterskillList.findIndex(x => x.order === masterSkill.order - 1);
        this.masterskillList[idx2].order = masterSkill.order;
        this.masterskillList[idx1].order = masterSkill.order - 1;
        this.saveChanges(this.masterskillList[idx1]);
        this.saveChanges(this.masterskillList[idx2]);
        this.masterskillList.sort((a, b) => a.order - b.order);
    }

    skillSwap(masterSkill: MasterSkill, index: string, orderUp: boolean): void {
        const idx = this.masterskillList.findIndex(x => x.uid === masterSkill.uid);
        const id1 = this.masterskillList[idx].skills.findIndex(x => x === index);
        const id2 = id1 + (orderUp ? 1 : -1);
        const temp = this.masterskillList[idx].skills[id1];
        this.masterskillList[idx].skills[id1] = this.masterskillList[idx].skills[id2];
        this.masterskillList[idx].skills[id2] = temp;
        this.saveChanges(this.masterskillList[idx]);
    }


    saveChanges(masterSkill: MasterSkill): void {
        this.afs
            .collection('masterSkills')
            .doc(masterSkill.uid).update(JSON.parse(JSON.stringify(masterSkill))).then(() => {
            });
    }

    createMasterSkill(): void {
        this.masterSkill.order = this.masterskillList.length + 1;
        this.masterskillList.push(this.masterSkill);
        this.afs.collection('masterSkills').add(JSON.parse(JSON.stringify(this.masterSkill))).then(res => {
            this.snackBar.open('Kompetence kategori oprettet', 'LUK',
                {
                    duration: 10000,
                });
            this.masterSkill = new MasterSkill();
        });
    }

    createSubSkill(masterSkill: MasterSkill, value: string): void {
        if (!value) {
            return;
        }
        masterSkill.skills.push(value);
        this.afs.collection('masterSkills').doc(masterSkill.uid).set(JSON.parse(JSON.stringify(masterSkill))).then(res => {
            this.snackBar.open('Kompetence oprettet', 'LUK',
                {
                    duration: 10000,
                });
        });
    }

    delete(masterSkill: MasterSkill, value: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af kompetencen, er du sikker på du vil slette denne kompetence? \n
                    Vær opmærksom på at denne kompetence stadig vil fremgå på de medarbejder der har den tildelt.`,
                    title: `Vil du slette ${value} kompetencen`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET KOMPETENCE'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                masterSkill.skills = this.removeInPlace(masterSkill.skills, value);
                this.afs.collection('masterSkills')
                    .doc(masterSkill.uid)
                    .set(JSON.parse(JSON.stringify(masterSkill)))
                    .then(res => {
                        this.snackBar.open('Kompetence slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                    });
            }
        });
    }


    deleteMasterSkill(masterSkill: MasterSkill): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af kompetence kategorien, er du sikker på du vil slette denne kompetence? \n
                    Vær opmærksom på at denne kompetence stadig vil fremgå på de medarbejder der har den tildelt.`,
                    title: `Vil du slette ${masterSkill.name} kompetence kategorien`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET KOMPETENCE'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.masterskillList = this.removeInPlace(this.masterskillList, masterSkill);
                this.afs.collection('masterSkills')
                    .doc(masterSkill.uid)
                    .delete()
                    .then(res => {
                        this.snackBar.open('Kompetence kategori slettet', 'LUK',
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
