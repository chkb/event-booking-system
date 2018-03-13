import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { LoginProviderService } from '../core/login-provider.service';
import { Employee } from '../shared/employee';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    displayName: string;
    employeeId: string;
    selectedEmployee: Employee;
    constructor(
        public auth: LoginProviderService,
        private route: ActivatedRoute,
        private router: Router,
        private afs: AngularFirestore
    ) { }

    ngOnInit() {
        this.employeeId = this.auth.userId;
        this.route.params.subscribe(params => {
            this.afs
                .collection('users')
                .doc(this.employeeId)
                .valueChanges()
                .subscribe((result: Employee) => {
                    this.selectedEmployee = result;
                });
        });
    }

    gotomyprofile(): void {
        this.router.navigate([`/employee`, this.auth.userId]);
    }
}
