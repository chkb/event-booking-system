import { Component, OnInit } from '@angular/core';
import { moveIn } from '../../router.animations';
import { Employee } from '../../shared/employee';

import { MatDialog, MatSnackBar } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';




@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  animations: [moveIn()],
  host: { '[@moveIn]': '' }
})
export class EmployeeCreateComponent implements OnInit {
  employee = new Employee();
  employeeList: Employee[] = [];
  name: string;
  mobile: string;
  email: string;
  role: string;


  constructor(
      private afs: AngularFirestore,
      private dialog: MatDialog,
      private snackBar: MatSnackBar
  ) { 
  }

  ngOnInit() {
  }

create(): void {
  this.employeeList.push(this.employee);
  this.afs.collection('employee').add(JSON.parse(JSON.stringify(this.employee))).then(res => {
    this.snackBar.open('Medarbejder oprettet', 'LUK',
      {
        duration: 10000,
      });
    this.employee = new Employee();
    console.log('employee created');
  });
}




}
