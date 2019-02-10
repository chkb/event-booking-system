import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort, MatTableDataSource } from '@angular/material';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';

import { moveIn } from '../../router.animations';
import { EventObject } from '../../shared/event';

export class PayoutDanish {
    Medarbejder: string;
    Dato: string;
    Event: string;
    Takst: number;
    Timer: number;
    Bonus: number;
    Sum: number;
}

export class PayoutObject {
    CVR: string;
    Medarbejdernummer: string;
    Loentype: string;
    Enheder: number;
    Sats: number;
    Beloeb: number;
    Child: PayoutDanish[];
}

declare function escape(s: string): string;
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    animations: [moveIn(),
    trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
        state('expanded', style({ height: '*' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
    ],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class PayoutAdminComponent implements OnInit {
    list: PayoutDanish[] = [];
    eventList: EventObject[] = [];
    startDate = new FormControl((new Date()).toISOString());
    endDate = new FormControl((new Date()).toISOString());
    dataSource: MatTableDataSource<PayoutObject>;
    selection = new SelectionModel<PayoutObject>(true, []);
    expandedElements: string[] = [];
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns = [
        'Selection',
        'Medarbejdernummer',
        'Loentype',
        'Enheder',
        'Sats',
        'Beloeb',
    ];
    // displayedColumns = [
    //     'Medarbejder',
    //     'Dato',
    //     'Event',
    //     'Takst',
    //     'Timer',
    //     'Bonus',
    //     'Sum'
    // ];

    constructor(
        private afs: AngularFirestore,
        private datepipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.getEmployeeData();
        this.getPayoutData();
    }

    getEmployeeData(): void {
        this.afs.collection('users').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                this.getAllEventHistory(false);
            });

        });
    }

    getPayoutData(): void {
        this.afs.collection('users').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                this.getAllEventHistory(false);
            });

        });
    }

    getAllEventHistory(getAll: boolean): void {
        const list: EventObject[] = [];
        this.afs.collection('events').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const event = new EventObject();
                event.payouts = doc.data()['payouts'];
                event.name = doc.data()['name'];
                event.dateFrom = doc.data()['dateFrom'];
                list.push(event);
            });
            this.eventList = list;
        });
    }

    search(): void {
        // tslint:disable-next-line:no-debugger
        const list: PayoutDanish[] = [];
        this.eventList.forEach(event => {
            if (event.payouts) {
                event.payouts.forEach(payout => {
                    const p = new PayoutDanish();
                    p.Medarbejder = payout.employee.displayName;
                    p.Dato = this.datepipe.transform(event.dateFrom).toString();
                    p.Event = event.name;
                    p.Takst = payout.wager;
                    p.Timer = payout.hours;
                    p.Sum = payout.sum;
                    const isAfterStartDate = moment(event.dateFrom)
                        .startOf('day')
                        .isSameOrAfter(moment(this.startDate.value)
                            .startOf('day'));

                    const isBeforeStartDate = moment(event.dateFrom)
                        .startOf('day')
                        .isSameOrBefore(moment(this.endDate.value)
                            .startOf('day'));

                    if (isAfterStartDate && isBeforeStartDate) {
                        list.push(p);
                    }
                });
                this.list = list;
                const parrentList = this.groupList(list, 'Medarbejder');
                this.dataSource = new MatTableDataSource(parrentList);
                this.dataSource.sort = this.sort;
            }
        });
    }

    groupList(collection: Array<any>, property: string): Array<any> {
        // prevents the application from breaking if the array of objects doesn't exist yet
        if (!collection) {
            return null;
        }
        const groupedCollection = collection.reduce((previous, current) => {
            if (!previous[current[property]]) {
                previous[current[property]] = [current];
            } else {
                previous[current[property]].push(current);
            }

            return previous;
        }, {});

        // this will return an array of objects, each object containing a group of objects
        return Object.keys(groupedCollection).map(key => {
            const obj = new PayoutObject();
            obj.CVR = '10105455';
            obj.Medarbejdernummer = key;
            obj.Loentype = 'Lønmodtager';
            obj.Enheder = this.getValue(groupedCollection[key], 'Timer');
            obj.Sats = this.getAvg(groupedCollection[key], 'Takst');
            obj.Beloeb = this.getValue(groupedCollection[key], 'Sum');
            obj.Child = groupedCollection[key];

            return obj;
        });
    }

    getValue(connections: any[], value: string): number {
        let count = 0;
        connections.forEach(element => {
            count = count + element[value];
        });

        return count;
    }

    getAvg(connections: any[], value: string): number {
        let sum = 0;
        let count = 0;
        connections.forEach(element => {
            sum = sum + element[value];
            count++;
        });

        return sum / count;
    }

    createCsv(): void {
        const startDateText = this.datepipe.transform(this.startDate.value).toString();
        const slutDateText = this.datepipe.transform(this.endDate.value).toString();
        const title = `Liste over lønninger for perioden: ${startDateText} til ${slutDateText} `;
        this.JSONToCSVConvertor(this.list, title, true);
    }



    removeDuplicateUsingFilter(arr) {
        const unique_array = arr.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        return unique_array;
    }


    JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
        const arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;

        let CSV = '';
        CSV += ReportTitle + '\r\n\n';

        if (ShowLabel) {
            let row = '';
            // tslint:disable-next-line:forin
            for (const index in arrData[0]) {
                row += index + ',';
            }
            row = row.slice(0, -1);
            CSV += row + '\r\n';
        }

        for (let i = 0; i < arrData.length; i++) {
            let row = '';

            // tslint:disable-next-line:forin
            for (const index in arrData[i]) {
                row += `'${arrData[i][index]}',`;
            }
            row.slice(0, row.length - 1);
            CSV += row + '\r\n';
        }

        if (CSV === '') {
            alert('Invalid data');
            return;
        }

        let fileName = 'Loen_data_';
        fileName += ReportTitle.replace(/ /g, '_');

        const uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        const link = document.createElement('a');
        link.href = uri;

        // link.style = 'visibility:hidden';
        link.download = fileName + '.csv';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;

        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected() ?
            this.selection.clear() :
            this.dataSource.data.forEach(row => this.selection.select(row));
    }

    isParrent = (i: number, row: Object) => row.hasOwnProperty('CVR');

    isChild = (i: number, row: Object) => row.hasOwnProperty('CVR');

    toggle(row: PayoutObject): void {
        const i: number = this.expandedElements.indexOf(row.Medarbejdernummer);
        (i > -1
            ? this.expandedElements.splice(i, 1)
            : this.expandedElements.push(row.Medarbejdernummer));
        this.selection.toggle(row);
    }
}
