import { AfterViewInit, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { LoginProviderService } from '../../core/login-provider.service';
import { EventObject } from '../../shared/event';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less']
})
export class PayoutListComponent implements AfterViewInit {
    displayedColumns = [
        'name',
        'eventLeader',
        'date',
        'time',
        'location',
        'customer',
        'staffNeed',
        'eventType',
        'payoutDone',
        'bookingDone',
    ];
    dataSource: MatTableDataSource<EventObject>;

    constructor(
        private afs: AngularFirestore,
        private router: Router,
        private lps: LoginProviderService
    ) {
        let eventList: EventObject[] = [];
        this.afs.collection('events').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const event = new EventObject();
                event.name = doc.data()['name'];
                event.dateFrom = doc.data()['dateFrom'];
                event.timeFrom = doc.data()['timeFrom'];
                event.dateTo = doc.data()['dateTo'];
                event.timeTo = doc.data()['timeTo'];
                event.eventLeader = doc.data()['eventLeader'];
                event.uid = doc.id;
                event.eventLocation = doc.data()['eventLocation'];
                event.customer = doc.data()['customer'];
                event.staffNeed = doc.data()['staffNeed'];
                event.billInfo = doc.data()['billInfo'];
                event.eventType = doc.data()['eventType'];
                event.eventTypeColor = doc.data()['eventTypeColor'];
                event.bookingDone = doc.data()['bookingDone'];
                event.payoutDone = doc.data()['payoutDone'];
                event.booked = doc.data()['booked'];
                event.eventLeaderId = doc.data()['eventLeaderId'];
                event.deative = doc.data()['deative'];
                if (this.lps.userId === event.eventLeaderId && !event.deative) {
                    eventList.push(event);
                }
            });
            eventList = eventList.sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());
            this.dataSource = new MatTableDataSource(eventList);
        });
    }

    ngAfterViewInit() {
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    gotoEvent(id: string): void {
        this.router.navigate(['/payout', id]);
    }
}
