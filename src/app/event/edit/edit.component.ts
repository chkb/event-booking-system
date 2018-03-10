import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { AngularFirestore } from 'angularfire2/firestore';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LocalStorageService } from '../../localstorage.service';
import { moveIn } from '../../router.animations';
import { Employee } from '../../shared/employee';
import { EventObject } from '../../shared/event';
import { EventType } from '../../shared/event-type';
import { Role } from '../../shared/role';
import { SkillExtended } from '../../shared/skill';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventEditComponent implements OnInit {
    selectedEvent: EventObject;
    eventId: string;
    searchFilterBucket: string[] = [];
    showFilters: boolean;
    startDate = new FormControl((new Date()).toISOString());
    endDate = new FormControl((new Date()).toISOString());
    minDate = new Date().toISOString();
    skillList: SkillExtended[] = [];
    event: EventObject = new EventObject();
    eventTypeList: EventType[] = [];
    displayedColumns = [
        'role',
        'displayName',
        'email',
        'mobile',
        'hasDriverLicens',
        'hasCar'
    ];
    dataSource: MatTableDataSource<Employee>;
    private readonly localstorageSkillListKey: string = 'search_skill_list';

    constructor(
        private route: ActivatedRoute,
        private afs: AngularFirestore,
        private router: Router,
        private localStorageService: LocalStorageService,
        private atp: AmazingTimePickerService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog
    ) {
        this.getEmployeeData();
        this.getFilterData();
        this.geteventTypeList();
    }

    getEmployeeData(): void {
        const employeeList: Employee[] = [];
        this.afs.collection('users').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const employee = new Employee();
                employee.displayName = doc.data()['displayName'];
                employee.email = doc.data()['email'];
                employee.photoURL = doc.data()['photoURL'];
                employee.uid = doc.id;
                employee.role = doc.data()['role'];
                employee.skills = doc.data()['skills'];
                employee.mobile = doc.data()['mobile'];
                employee.hasCar = doc.data()['hasCar'];
                employee.hasDriverLicens = doc.data()['hasDriverLicens'];
                if (this.searchFilterBucket.length) {
                    let count = 0;
                    this.searchFilterBucket.forEach(skill => {
                        if (employee.skills && employee.skills.length && this.isInArray(employee.skills, skill)) {
                            count++;
                        }
                    });
                    if (count) {
                        employeeList.push(employee);
                    }
                } else {
                    employeeList.push(employee);
                }
            });
            this.dataSource = new MatTableDataSource(employeeList);
            this.localStorageService.setItem(this.localstorageSkillListKey, this.skillList);
        });
    }

    geteventTypeList(): void {
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

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.eventId = params['id'];
            this.afs
                .collection('events')
                .doc(this.eventId)
                .valueChanges()
                .subscribe((result: EventObject) => {
                    this.selectedEvent = result;
                });
        });
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    addToSearchFilter(skill: string): void {
        if (this.isInArray(this.searchFilterBucket, skill)) {
            this.removeInPlace(this.searchFilterBucket, skill);
        } else {
            this.searchFilterBucket.push(skill);
        }
        setInterval(() => {
            this.getEmployeeData();
        }, 300);
    }

    isInArray(array, value) {
        return array.indexOf(value) > -1;
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

    update(navigate: boolean): void {
        this.afs
            .collection('events')
            .doc(this.eventId).update(this.selectedEvent).then(() => {
                this.snackBar.open('Begivenhed opdateret', 'LUK',
                    {
                        duration: 10000,
                    });
                if (navigate) {
                    this.router.navigate([`/event/list`]);
                }
            });
    }

    delete(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: 'Dette er en permanent sletning af begivenhed, er du sikker på du vil slette denne begivenhed?',
                    title: `Vil du slette ${this.selectedEvent.name}`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET BEGIVENHED'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.afs
                    .collection('events')
                    .doc(this.eventId).delete().then(() => {
                        this.snackBar.open('Begivenhed slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                        this.router.navigate([`/event/list`]);
                    });
            }
        });
    }

    bookingDone(): void {
        this.selectedEvent.bookingDone = !this.selectedEvent.bookingDone;
        this.update(false);
    }

    payoutDone(): void {
        this.selectedEvent.payoutDone = !this.selectedEvent.payoutDone;
        this.update(false);
    }

    getFilterData(): void {
        const localstorageSkillList = this.localStorageService.getItem<SkillExtended[]>(this.localstorageSkillListKey);
        if (localstorageSkillList) {
            this.searchFilterBucket = [];
            this.skillList = localstorageSkillList;
            this.skillList.forEach(skill => {
                if (skill.selected) {
                    this.searchFilterBucket.push(skill.name);
                }
            });
            this.getEmployeeData();
        } else {
            this.skillList = [];
            this.afs.collection('skills').ref.get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const skill = new SkillExtended();
                    skill.name = doc.data()['name'];
                    skill.uid = doc.id;
                    this.skillList.push(skill);
                });
            });
        }
    }

    getRoleText(value: string): string {
        if (!value) {
            return 'Ingen rolle angivet';
        }
        const roleText = Role[value];

        return roleText;
    }
}
