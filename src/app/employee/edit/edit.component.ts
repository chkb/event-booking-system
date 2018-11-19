import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LoginProviderService } from '../../core/login-provider.service';
import { moveIn } from '../../router.animations';
import { Employee, Skill } from '../../shared/employee';
import { MasterSkill } from '../../shared/skill';
import { Wager } from '../../shared/wager';
import { EmployeeDialogComponent } from '../../employee-dialog/employee-dialog.component';

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
    selectedSkills: MasterSkill[] = [];
    showUniqueId: boolean;
    wagerList: Wager[];
    roles = [
        { value: 'employee', viewValue: 'Basis' },
        { value: 'eventLeader', viewValue: 'Eventleder' },
        { value: 'admin', viewValue: 'Administrator' }
    ];

    masterskills: MasterSkill[] = [];
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private afs: AngularFirestore,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private lps: LoginProviderService
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.employeeId = params['id'];
            this.afs
                .collection('users')
                .doc(this.employeeId)
                .valueChanges()
                .subscribe((result: Employee) => {
                    this.selectedEmployee = result;
                });
        });
        this.getEmployeeData();
        this.getWagerData();
    }

    getEmployeeData(): void {
        this.afs.collection('masterSkills').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterskill = new MasterSkill();
                masterskill.name = doc.data()['name'];
                masterskill.hasRating = doc.data()['hasRating'];
                masterskill.onlyAdminEdit = doc.data()['onlyAdminEdit'];
                masterskill.ratingValue1 = doc.data()['ratingValue1'];
                masterskill.ratingValue2 = doc.data()['ratingValue2'];
                masterskill.ratingValue3 = doc.data()['ratingValue3'];
                masterskill.skills = doc.data()['skills'];
                masterskill.uid = doc.id;
                this.masterskills.push(masterskill);
                this.selectedSkills.forEach(item => {
                    this.removeInPlace(this.masterskills, item);
                });
            });
            this.sortSkillFromEmployee();
        });
    }

    getWagerData(): void {
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

    sortSkillFromEmployee() {
        if (this.selectedEmployee && this.selectedEmployee.skills && this.masterskills) {
            this.selectedEmployee.skills.forEach(employeeSkill => {
                const idx = this.masterskills.findIndex(x => x.uid === employeeSkill.uid);
                this.removeInPlace(this.masterskills[idx].skills, employeeSkill.name);
            });
        }
    }

    saveChanges(): void {
        this.afs
            .collection('users')
            .doc(this.employeeId)
            .update(JSON.parse(JSON.stringify(this.selectedEmployee)))
            .then(() => {
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

    deactiveEmployee(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: 'Dette er en deaktivering af medarbejderen, er du sikker på du vil deaktivere denne medarbejder?',
                    title: `Vil du deaktivere ${this.selectedEmployee.displayName}`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'DEAKTIVÈR MEDARBEJDER'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.selectedEmployee.deactive = true;
                this.saveChanges();
            }
        });
    }

    enableEmployee(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: 'Dette er en aktivering af medarbejderen, er du sikker på du vil aktivere denne medarbejder?',
                    title: `Vil du aktivere ${this.selectedEmployee.displayName}`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'AKTIVÈR MEDARBEJDER'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.selectedEmployee.deactive = false;
                this.saveChanges();
            }
        });
    }

    addSkill(masterskillId: string, skill: string, isOnlyAdmin?: boolean, ranking?: number, ratingText?: string): void {
        // FE stuff
        this.removeFromFEList(masterskillId, skill);
        // BE stuff
        const skillObject = new Skill();
        skillObject.uid = masterskillId;
        skillObject.name = skill;
        skillObject.isOnlyadmin = isOnlyAdmin;
        skillObject.ranking = ranking;
        skillObject.ratingText = ratingText;
        if (!this.selectedEmployee.skills) {
            const tempSkillList: Skill[] = [];
            tempSkillList.push(skillObject);
            this.selectedEmployee.skills = tempSkillList;
        } else {
            this.selectedEmployee.skills.push(skillObject);
        }
        this.saveChanges();

    }

    setWager(wager: number): void {
        this.selectedEmployee.personalWager = wager;
    }

    removeFromFEList(masterskillId: string, skill: string): void {
        // FE stuff
        const idx = this.masterskills.findIndex(x => x.uid === masterskillId);
        this.removeInPlace(this.masterskills[idx].skills, skill);
    }

    removeSkill(skill: Skill): void {
        const idx = this.masterskills.findIndex(x => x.uid === skill.uid);
        this.masterskills[idx].skills.push(skill.name);
        this.removeInPlace(this.selectedEmployee.skills, skill);
        this.saveChanges();
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

    isThisMe(): boolean {
        if (this.lps.userId === this.selectedEmployee.uid) {
            return true;
        }

        return false;
    }

    isAdminOrEventLeader() {
        if (this.lps.role === 'admin' || this.lps.role === 'eventLeader') {
            return true;
        }

        return false;
    }

    isAdmin() {
        if (this.lps.role === 'admin') {
            return true;
        }

        return false;
    }
}
