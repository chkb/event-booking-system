import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../../shared/employee';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
    selector: 'app-employee-view',
    templateUrl: './view.component.html',
    styleUrls: ['./view.component.css']
})
export class EmployeeViewComponent implements OnInit {
    @Input() employeeId: string;
    selectedEmployee: Employee;
    constructor(
        private afs: AngularFirestore,
    ) {
    }

    ngOnInit() {
        this.afs
            .collection('users')
            .doc(this.employeeId)
            .valueChanges()
            .subscribe((result: Employee) => {
                this.selectedEmployee = result;
            });
    }
}
