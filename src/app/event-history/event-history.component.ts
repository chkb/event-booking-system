import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { EventHistory } from '../shared/event';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';


@Component({
    selector: 'app-event-history',
    templateUrl: './event-history.component.html',
    styleUrls: ['./event-history.component.less']
})
export class EventHistoryComponent implements OnInit {
    @Input() employeeId: string;
    dataSource: MatTableDataSource<EventHistory>;
    displayedColumns = [
        'employeeName',
        'eventName',
        'date',
        'comments'
    ];
    constructor(
        private afs: AngularFirestore,
        private router: Router
    ) { }

    ngOnInit() {
        if (this.employeeId) {
            this.getEmployeeData();
        }
    }

    getEmployeeData(): void {
        const list: EventHistory[] = [];
        const year = moment().year().toString();
        this.afs.collection('event-history').ref.doc(this.employeeId).collection(year).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const eh = new EventHistory();
                eh.comments = doc.data()['comments'];
                eh.employeeName = doc.data()['employeeName'];
                eh.employeeUid = doc.data()['employeeUid'];
                eh.eventName = doc.data()['eventName'];
                eh.eventUid = doc.data()['eventUid'];
                eh.date = doc.data()['date'];
                list.push(eh);
            });
            this.dataSource = new MatTableDataSource(list);
        });
    }

    gotoEvent(id: string): void {
        this.router.navigate(['/event', id]);
    }
}
