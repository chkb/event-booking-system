import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class EmployeeViewComponent implements OnInit {

  constructor( private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
        const employeeId = params['id'];
        console.log(employeeId);
    });
  }

}
