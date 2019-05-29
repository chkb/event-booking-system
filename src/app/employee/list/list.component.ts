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
export class EmployeeListComponent implements OnInit {
    loading = false;
    employeeList: Employee[] = [];
    displayedColumns = [
        'role',
        'displayName',
        'email',
        'mobile',
        'hasDriverLicens',
        'hasCar',
        'deactive'
    ];
    dataSource: MatTableDataSource<Employee>;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private afs: AngularFirestore,
        private router: Router
    ) {
    }

    ngOnInit() {
        //this.getData();
        this.getEmployeeData();
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
                employee.deactive = doc.data()['deactive'];
                employeeList.push(employee);
            });
            this.loading = false;
            this.employeeList = employeeList;
            this.dataSource = new MatTableDataSource(employeeList);
        });
    }

    getEmployeeData(): void {
        this.loading = true;
        this.afs
            .collection('users', ref => ref
                .orderBy('displayName')
                .limit(1000))
            .valueChanges()
            .subscribe(employeeList => this.setEmployeeData(employeeList));
    }

    setEmployeeData(employeeList: any): void {
        this.loading = false;
        this.dataSource = new MatTableDataSource(employeeList);
        this.dataSource.sort = this.sort;

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
