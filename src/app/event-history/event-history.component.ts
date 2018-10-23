import { Component, Input, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

import { LoginProviderService } from '../core/login-provider.service';
import { EventHistory, EventHistoryViewModel, Booked } from '../shared/event';


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
        private router: Router,
        private lps: LoginProviderService
    ) {

    }

    ngOnInit() {
        if (this.employeeId) {
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
                        this.list.push(eh);
                    }
                });
            });
        });
        this.list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.dataSource = new MatTableDataSource(this.list);
    }

    gotoEvent(id: string): void {
        if (!this.isAdminOrEventLeader()) {
            return;
        }
        this.router.navigate(['/event', id]);
    }

    isAdminOrEventLeader(): boolean {
        if (this.lps.role === 'admin' || this.lps.role === 'eventLeader') {
            return true;
        }

        return false;
    }
}
