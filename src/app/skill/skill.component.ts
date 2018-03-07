import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Skill } from '../shared/skill';

@Component({
    selector: 'app-skill',
    templateUrl: './skill.component.html',
    styleUrls: ['./skill.component.less']
})
export class SkillComponent implements OnInit {
    skillList: Skill[] = [];
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
        this.skillList = [];
        this.afs.collection('skills').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const skill = new Skill();
                skill.name = doc.data()['name'];
                skill.uid = doc.id;
                this.skillList.push(skill);
            });
        });
    }

    create(): void {
        const skill = { name: this.value };
        this.afs.collection('skills').add(skill).then(res => {
            this.getData();
            this.snackBar.open('Kompetence oprettet', 'LUK',
                {
                    duration: 10000,
                });
        });
    }

    delete(skill: Skill): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Dette er en permanent sletning af kompetencen, er du sikker på du vil slette denne kompetence? \n
                    Vær opmærksom på at denne kompetence stadig vil fremgå på de medarbejder der har den tildelt.`,
                    title: `Vil du slette ${skill.name} kompetencen`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET KOMPETENCE'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.afs
                    .collection('skills')
                    .doc(skill.uid).delete().then(() => {
                        this.snackBar.open('Kompetence slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                    });
            }
        });
    }

}
