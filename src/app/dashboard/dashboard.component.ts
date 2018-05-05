import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { LoginProviderService } from '../core/login-provider.service';
import { Employee } from '../shared/employee';
import { Stat } from '../shared/stat';
import { VoronoiSite } from 'd3';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent implements OnInit {
    displayName: string;
    employeeId: string;
    selectedEmployee: Employee;
    statContract: Stat;
    statLicens: Stat;
    statCar: Stat;
    employeeList: Employee[] = [];
    constructor(
        public auth: LoginProviderService,
        private route: ActivatedRoute,
        private router: Router,
        private afs: AngularFirestore,
        private lps: LoginProviderService
    ) {
        afs.firestore.settings({ timestampsInSnapshots: true });        
    }

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
        this.getEmployees();
    }

    getEmployees(): void {
        this.employeeList = [];
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
                employee.contractSigned = doc.data()['contractSigned'];
                this.employeeList.push(employee);
            });
            this.getStatOfContractsSigned();
            this.getStatOfDriverlicens();
            this.getStatOfCar();
        });
    }

    getStatOfContractsSigned(): void {
        let number = 0;
        this.employeeList.forEach(employee => {
            if (employee.contractSigned) {
                number++;
            }
        });

        const totalCount = this.employeeList.length;
        this.statContract = new Stat();
        this.statContract.percentage = this.getRelativePercentage(totalCount, number);
        this.statContract.value = ` ${number} ud af ${totalCount}`;
        this.statContract.unit = 'medarbejdere';
        this.statContract.text = 'Antal medarbejdere der har underskrevet kontrakt';
    }

    getStatOfDriverlicens(): void {
        let number = 0;
        this.employeeList.forEach(employee => {
            if (employee.hasDriverLicens) {
                number++;
            }
        });

        const totalCount = this.employeeList.length;
        this.statLicens = new Stat();
        this.statLicens.percentage = this.getRelativePercentage(totalCount, number);
        this.statLicens.value = ` ${number} ud af ${totalCount}`;
        this.statLicens.unit = 'medarbejdere';
        this.statLicens.text = 'Antal medarbejdere der har kørekort';
    }

    getStatOfCar(): void {
        let number = 0;
        this.employeeList.forEach(employee => {
            if (employee.hasCar) {
                number++;
            }
        });

        const totalCount = this.employeeList.length;
        this.statCar = new Stat();
        this.statCar.percentage = this.getRelativePercentage(totalCount, number);
        this.statCar.value = ` ${number} ud af ${totalCount}`;
        this.statCar.unit = 'medarbejdere';
        this.statCar.text = 'Antal medarbejdere der har egen bil';
    }

    private getRelativePercentage(amountForMany: number, amountForSingle: number): number {
        return ((100 / amountForMany) * amountForSingle);
    }

    gotomyprofile(): void {
        this.router.navigate([`/employee`, this.auth.userId]);
    }

    isAdmin() {
        if (this.lps.role === 'admin') {
            return true;
        }

        return false;
    }

    isEmployee() {
        if (this.lps.role === 'employee') {
            return true;
        }

        return false;
    }
}
