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
    ) { }

    ngOnInit() {
        if (this.employeeId) {
            this.getEmployeeData();
        }
    }

    getEmployeeData(): void {
        this.list = [];
        this.afs.collection(`event-history/${this.employeeId}/2018`).ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const bookedEvent = doc.data();
                if (bookedEvent) {
                    const eh = new EventHistoryViewModel();
                    eh.comments = bookedEvent.comments;
                    eh.date = moment(bookedEvent.date).toDate();
                    eh.employeeName = bookedEvent.employeeName;
                    eh.employeeUid = this.employeeId;
                    eh.eventUid = bookedEvent.eventUid;
                    eh.eventName = bookedEvent.eventName;
                    this.list.push(eh);
                }
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
