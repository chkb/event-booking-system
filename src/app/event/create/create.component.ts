import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';

import { EventObject } from '../../shared/event';
import { Employee } from '../../shared/employee';

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.css']
})
export class EventCreateComponent implements OnInit {
    event: EventObject;
    employeeList: Employee[] = [];
    constructor(
        private afs: AngularFirestore,
        private dialog: MatDialog,
        private snackBar: MatSnackBar) { }

    ngOnInit() {
        this.getEmployees();
    }

    create(): void {
        this.afs.collection('event').add(this.event).then(res => {
            this.snackBar.open('Kompetence oprettet', 'LUK',
                {
                    duration: 10000,
                });
        });
    }

    getEmployees(): void {
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
                employee.skills = doc.data()['skills'];
                employee.comment = doc.data()['comment'];
                employee.hasDriverLicens = doc.data()['hasDriverLicens'];
                this.employeeList.push(employee);
            });
        });
    }
}
