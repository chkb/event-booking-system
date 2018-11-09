import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

import { LoginProviderService } from '../core/login-provider.service';
import { EventHistory, EventObject, EventHistoryViewModel, Booked } from '../shared/event';


@Component({
    selector: 'app-event-upcomming',
    templateUrl: './event-upcomming.component.html',
    styleUrls: ['./event-upcomming.component.less']
})
export class EventUpcommingComponent implements OnInit {
    loading = false;
    @Input() employeeId: string;
    list: EventHistory[] = [];

    dataSource: MatTableDataSource<EventHistory>;
    displayedColumns = [
        'employeeName',
        'eventName',
        'eventleader',
        'date',
        'location',
        'comments'
    ];
    constructor(
        private afs: AngularFirestore,
        private router: Router,
        private lps: LoginProviderService
    ) {

    }

    ngOnInit() {
        if (this.employeeId) {
            this.loading = true;
            this.getEmployeeData();
        }
    }

    getEmployeeData(): void {
        this.list = [];
        this.afs.collection('events').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const bookedList = doc.data()['booked'];
                bookedList.forEach((booked: Booked) => {
                    const eh = new EventHistoryViewModel();
                    if (booked.uid === this.employeeId) {
                        eh.comments = booked.comment;
                        eh.employeeName = booked.displayName;
                        eh.employeeUid = booked.uid;
                        eh.eventUid = doc.id;
                        eh.event = doc.data();
                        eh.date = doc.data()['dateFrom'];
                        const today = moment().endOf('day');
                        if (moment(eh.date).isAfter(today)) {
                            console.table(eh);
                            this.list.push(eh);
                        }
                    }
                });
            });
            this.list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            this.dataSource = new MatTableDataSource(this.list);
            this.loading = false;
        });
    }

    gotoEvent(id: string): void {
        this.router.navigate(['/event', id]);
    }

    isAdminOrEventLeader(): boolean {
        if (this.lps.role === 'admin' || this.lps.role === 'eventLeader') {
            return true;
        }

        return false;
    }
}
