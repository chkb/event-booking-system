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
    list: EventHistory[] = [];

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
        this.list = [];
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
                this.list.push(eh);
            });
            this.list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            this.dataSource = new MatTableDataSource(this.list);
        });
    }

    gotoEvent(id: string): void {
        this.router.navigate(['/event', id]);
    }
}
