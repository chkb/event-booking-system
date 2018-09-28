import { AfterViewInit, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import * as moment from 'moment';

import { EventObject } from '../../shared/event';
import { moveIn } from '../../router.animations';

@Component({
    selector: 'app-event-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventListComponent implements AfterViewInit {
    viewAllUpcomming = false;
    viewAllPrev = false;
    getAllCheckBox: boolean;
    getAllPrevCheckBox: boolean;
    displayedColumns = [
        'date',
        'time',
        'name',
        'eventType',
        'location',
        'eventLeader',
        'staffNeed',
        'bookingDone',
        'payoutDone',
        'billInfo'
    ];
    dataSource: MatTableDataSource<EventObject>;
    dataPrevSource: MatTableDataSource<EventObject>;

    constructor(
        private afs: AngularFirestore,
        private router: Router
    ) {
        afs.firestore.settings({ timestampsInSnapshots: true });
        this.getdata(false);
    }

    getdata(getAll: boolean): void {
        const now = moment().startOf('day');
        let eventList: EventObject[] = [];
        let eventPrevList: EventObject[] = [];
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
                event.deative = doc.data()['deative'];
                if (!getAll && !event.deative) {
                    if (moment(event.dateFrom).isSameOrAfter(now)) {
                        eventList.push(event);
                    } else {
                        if (moment(event.dateFrom).isSame(now, 'year')) {
                            eventPrevList.push(event);
                        }
                    }
                } else if (getAll) {
                    if (moment(event.dateFrom).isSameOrAfter(now)) {
                        eventList.push(event);
                    } else {
                        eventPrevList.push(event);
                    }
                }
            });
            eventList = eventList.sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());
            this.dataSource = new MatTableDataSource(eventList);
            eventPrevList = eventPrevList.sort((a, b) => new Date(b.dateFrom).getTime() - new Date(a.dateFrom).getTime());
            this.dataPrevSource = new MatTableDataSource(eventPrevList);
        });
    }

    ngAfterViewInit() {
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    applyFilterPrev(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataPrevSource.filter = filterValue;
    }

    gotoEvent(id: string): void {
        this.router.navigate(['/event', id]);
    }
}
