import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { moveIn } from '../../router.animations';
import { Employee } from '../../shared/employee';
import { Skill } from '../../shared/skill';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EmployeeEditComponent implements OnInit {
    selectedEmployee: Employee;
    employeeId: string;
    selectedSkills: string[] = [];
    roles = [
        { value: 'employee', viewValue: 'Medarbejder' },
        { value: 'eventLeader', viewValue: 'Eventleder' },
        { value: 'projectLeader', viewValue: 'Projektleder' },
        { value: 'admin', viewValue: 'Administrator' }
    ];

    skills = [];
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private afs: AngularFirestore,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.employeeId = params['id'];
            this.afs
                .collection('users')
                .doc(this.employeeId)
                .valueChanges()
                .subscribe((result: Employee) => {
                    this.selectedEmployee = result;
                    this.selectedSkills = this.selectedEmployee.skills;
                    this.selectedSkills.forEach(item => {
                        this.removeInPlace(this.skills, item);
                    });
                });
        });

        this.afs.collection('skills').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const skill = new Skill();
                skill.name = doc.data()['name'];
                skill.uid = doc.id;
                this.skills.push(skill.name);
                this.selectedSkills.forEach(item => {
                    this.removeInPlace(this.skills, item);
                });
            });
        });
    }

    saveChanges(): void {
        this.afs
            .collection('users')
            .doc(this.employeeId).update(this.selectedEmployee).then(() => {
                this.snackBar.open('Medarbejder opdateret', 'LUK',
                    {
                        duration: 10000,
                    });
            });
    }

    deleteEmployee(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: 'Dette er en permanent sletning af medarbejderen, er du sikker på du vil slette denne medarbejder?',
                    title: `Vil du slette ${this.selectedEmployee.displayName}`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET MEDARBEJDER'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.afs
                    .collection('users')
                    .doc(this.employeeId).delete().then(() => {
                        this.snackBar.open('Medarbejder slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                        this.router.navigate([`/employee/list`]);
                    });
            }
        });
    }

    addSkill(skill: string): void {
        this.selectedSkills.push(skill);
        this.selectedEmployee.skills = this.selectedSkills;
        this.removeInPlace(this.skills, skill);
    }

    removeSkill(skill: string): void {
        this.skills.push(skill);
        this.removeInPlace(this.selectedSkills, skill);
        this.removeInPlace(this.selectedEmployee.skills, skill);
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
