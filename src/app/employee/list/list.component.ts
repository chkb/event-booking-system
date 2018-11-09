import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

import { moveIn } from '../../router.animations';
import { Employee } from '../../shared/employee';
import { Role } from '../../shared/role';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
    loading = false;
    employeeList: Employee[] = [];
    displayedColumns = [
        'role',
        'displayName',
        'email',
        'mobile',
        'hasDriverLicens',
        'hasCar'
    ];
    dataSource: MatTableDataSource<Employee>;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private afs: AngularFirestore,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.getData();
    }

    getData(): void {
        this.loading = true;
        const employeeList: Employee[] = [];
        this.afs.collection('users').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const employee = new Employee();
                employee.displayName = doc.data()['displayName'];
                employee.email = doc.data()['email'];
                employee.photoURL = doc.data()['photoURL'];
                employee.uid = doc.id;
                employee.role = doc.data()['role'];
                employee.mobile = doc.data()['mobile'];
                employee.hasCar = doc.data()['hasCar'];
                employee.hasDriverLicens = doc.data()['hasDriverLicens'];
                employeeList.push(employee);
            });
            this.loading = false;
            this.employeeList = employeeList;
            this.dataSource = new MatTableDataSource(employeeList);
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.dataSource.sort = this.sort;
        }, 1000);
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    gotoEmployee(id: string): void {
        this.router.navigate(['/employee', id]);
    }

    getRoleText(value: string): string {
        if (!value) {
            return 'Ingen rolle angivet';
        }
        const roleText = Role[value];

        return roleText;
    }
}
