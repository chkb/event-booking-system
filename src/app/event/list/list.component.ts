import { AfterViewInit, Component } from '@angular/core';
import { MatTableDataSource, MatSlideToggleChange } from '@angular/material';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

import { EventObject } from '../../shared/event';
import { moveIn } from '../../router.animations';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-event-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventListComponent implements AfterViewInit {
    afterLoading = false;
    beforeLoading = false;
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
        this.getAfterToday(false);
        this.getBeforeToday(false);
    }

    beforeEventToggle(toggle: MatSlideToggleChange): void {
        this.getBeforeToday(toggle.checked);
    }

    getBeforeToday(getAll: boolean): void {
        this.setDataBeforeToday([]);
        this.beforeLoading = true;
        this.afs
            .collection('events', ref => ref
                .orderBy('dateFrom', 'desc')
                .orderBy('timeFrom')
                .where('dateFrom', '<', moment().format('YYYY-MM-DD'))
                .limit(getAll ? 1000 : 20))
            .valueChanges()
            .subscribe(events => this.setDataBeforeToday(events));
    }

    setDataBeforeToday(events: any): void {
        this.dataPrevSource = new MatTableDataSource(events);
        this.beforeLoading = false;
    }

    afterEventToggle(toggle: MatSlideToggleChange): void {
        this.getAfterToday(toggle.checked);
    }

    getAfterToday(getAll: boolean): void {
        this.setDataAfterToday([]);
        this.afterLoading = true;
        this.afs
            .collection('events', ref => ref
                .orderBy('dateFrom')
                .orderBy('timeFrom')
                .where('dateFrom', '>', moment().format('YYYY-MM-DD'))
                .limit(getAll ? 1000 : 20))
            .valueChanges()
            .subscribe(events => {
                this.setDataAfterToday(events);
            });
    }

    setDataAfterToday(events: any): void {
        this.dataSource = new MatTableDataSource(events);
        this.afterLoading = false;
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
