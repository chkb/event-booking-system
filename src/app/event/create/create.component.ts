import { AfterViewInit, Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

import { LocalStorageService } from '../../localstorage.service';
import { moveIn } from '../../router.animations';
import { Employee } from '../../shared/employee';
import { EventObject } from '../../shared/event';
import { Role } from '../../shared/role';
import { SkillExtended } from '../../shared/skill';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventCreateComponent implements AfterViewInit {
    searchFilterBucket: string[] = [];
    showFilters: boolean;
    minDate = new Date().toISOString();
    skillList: SkillExtended[] = [];
    event: EventObject = new EventObject();
    startTime = '18:00';
    endTime = '22:00';
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
        private afs: AngularFirestore,
        private router: Router,
        private localStorageService: LocalStorageService,
        private snackBar: MatSnackBar
    ) {

        this.getEmployeeData();
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

    ngAfterViewInit() {
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

    create(): void {
        if (!this.event.dateTo) {
            this.event.dateTo = this.event.dateFrom;
        }
        if (!this.event && !this.event.name) {
            this.snackBar.open('Navn skal udfyldes før du kan oprette en begivenhed', 'LUK',
                {
                    duration: 10000,
                });
            return;
        }
        this.afs.collection('events').add(JSON.parse(JSON.stringify(this.event))).then(res => {
            this.snackBar.open('Event oprettet', 'LUK',
                {
                    duration: 10000,
                });
            this.router.navigate(['/event/', res.id]);
        });
    }

    getRoleText(value: string): string {
        if (!value) {
            return 'Ingen rolle angivet';
        }
        const roleText = Role[value];

        return roleText;
    }
}
