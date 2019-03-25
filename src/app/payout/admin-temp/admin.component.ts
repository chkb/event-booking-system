import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material';
import { Router } from '@angular/router';
import * as moment from 'moment';
// tslint:disable-next-line:import-blacklist
import { Observable } from 'rxjs';

import { moveIn } from '../../router.animations';
import { EventObject, Payout } from '../../shared/event';

export class PayoutDanish {
    medarbejder: string;
    medarbejderUid: string;
    payrollNumber: string;
    uniqueId: string;
    paymentMethod: string;
    dato: string;
    fra: string;
    til: string;
    event: string;
    eventId: string;
    takst: number;
    timer: number;
    bonus: number;
    comment: string;
    sum: number;
    udbetalt: boolean;
}

export class PayoutObject {
    cvr: string;
    medarbejdernummer: string;
    medarbejderUid: string;
    udbetaling: string;
    medarbejder: string;
    loentype: string;
    enheder: number;
    sats: number;
    beloeb: number;
    child: PayoutDanish[];
    event: string;
}

@Component({
    selector: 'app-admin-2',
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
export class TableExpandableRowsComponent implements OnInit {
    selection = new SelectionModel<PayoutObject>(true, []);
    list: PayoutDanish[] = [];
    parrentList: any[] = [];
    eventList: EventObject[] = [];
    startDate = new FormControl((moment().startOf('month').toISOString()));
    endDate = new FormControl((new Date()).toISOString());
    expandedElements: string[] = [];
    loading = false;
    modifiedList = [];
    csvList = [];
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns = [
        'Medarbejdernummer',
        'Timer',
        'Beloeb',
        'function',
    ];
    dataSource = [];

    constructor(
        private afs: AngularFirestore,
        private datepipe: DatePipe,
        private router: Router
    ) { }

    ngOnInit() {
        this.updateDatabase();
    }

    updateDatabase(): void {
        this.loading = true;
        this.afs.collection('events').ref.get().then(querySnapshot => {
            let list = [];
            querySnapshot.forEach(doc => {
                const payoutList = doc.data()['payouts'];
                list = payoutList.map((payout: Payout) => {
                    const payoutModified = new PayoutDanish();
                    payoutModified.bonus = payout.bonus ? payout.bonus : 0;
                    payoutModified.comment = payout.comment ? payout.comment : 'ingen';
                    payoutModified.dato = doc.data()['dateFrom'];
                    payoutModified.fra = payout.timeFrom;
                    payoutModified.til = payout.timeTo;
                    payoutModified.event = doc.data()['name'];
                    payoutModified.eventId = doc.id;
                    payoutModified.medarbejder = payout.employee.displayName;
                    payoutModified.payrollNumber = payout.employee.payrollNumber;
                    payoutModified.medarbejderUid = payout.employee.uid;
                    payoutModified.paymentMethod = payout.employee.paymentMethod ? payout.employee.paymentMethod : 'N/A';
                    payoutModified.sum = payout.sum;
                    payoutModified.takst = payout.wager;
                    payoutModified.timer = payout.hours;

                    return payoutModified;
                });
                this.upsertPayoutData(list);
            });
        });
    }

    upsertPayoutData(list: any[]): void {
        const countLength = list.length;
        let count = 0;
        list.forEach((payout: PayoutDanish) => {
            if (!payout) {
                return;
            }
            this.modifiedList.push(payout);
            count++;
            this.afs
                .collection('payouts')
                .doc(`${payout.dato}_${payout.medarbejderUid}_${payout.fra}_${payout.til}`)
                .set(JSON.parse(JSON.stringify(payout)));

            if (count === countLength) {
                this.loading = false;
            }
        });
    }

    search(): void {
        this.afs
            .collection('payouts', ref => ref
                .orderBy('dato', 'asc')
                .where('dato', '<=', moment(this.endDate.value).format('YYYY-MM-DD'))
                .where('dato', '>', moment(this.startDate.value).format('YYYY-MM-DD')))
            .valueChanges()
            .subscribe(events => {
                const parrentList = this.groupList(events, 'medarbejderUid');
                this.parrentList = events;
                this.csvList = this.groupListToCsv(events);
                this.dataSource = parrentList;
            });
    }


    // updateAllData(event: MatCheckboxChange): void {
    //     this.list.forEach(payout => {
    //         payout.udbetalt = event.checked;
    //         this.updateEntry(event, payout);
    //     });
    //     this.search();
    // }

    // updateAllEntries(event: MatCheckboxChange, payouts: PayoutDanish[]): void {
    //     payouts.forEach(payout => {
    //         this.updateEntry(event, payout);
    //     });
    // }

    // updateEntry(event: MatCheckboxChange, payout: PayoutDanish): void {
    //     payout.udbetalt = event.checked;
    //     this.afs
    //         .collection('payouts-admin')
    //         .doc(`${payout.dato}_${payout.medarbejderUid}_${payout.fra}_${payout.til}`)
    //         .set(JSON.parse(JSON.stringify(payout))).then(x => console.log('sucess!'));
    // }

    getDocument(collection: string, id: string): Observable<any> {
        return this.afs
            .collection(collection)
            .doc(id)
            .valueChanges();
    }

    groupListToCsv(collection: any[]): any[] {
        const list = [];
        // this will return an array of objects, each object containing a group of objects
        collection.forEach(payout => {
            const obj = new PayoutObject();
            obj.cvr = '10105455';
            obj.medarbejder = payout.medarbejder;
            obj.event = payout.event;
            obj.medarbejdernummer = payout.payrollNumber ? payout.payrollNumber : 'Ikke angivet';
            obj.loentype = payout.paymentMethod ? payout.paymentMethod : 'Ikke angivet';
            obj.enheder = payout.timer ? payout.timer : 0;
            obj.sats = payout.takst ? payout.takst : 0;
            obj.beloeb = payout.sum ? payout.sum : 0;
            list.push(obj);
        });
        return list;
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
            obj.cvr = '10105455';
            obj.medarbejder = groupedCollection[key][0]['medarbejder'];
            obj.medarbejderUid = groupedCollection[key][0]['medarbejderUid'];
            obj.medarbejdernummer = groupedCollection[key][0]['payrollNumber'];
            obj.loentype = groupedCollection[key][0]['paymentMethod'] ? groupedCollection[key][0]['paymentMethod'] : 'Ikke angivet';
            obj.enheder = this.getValue(groupedCollection[key], 'timer');
            obj.sats = this.getAvg(groupedCollection[key], 'takst');
            obj.beloeb = this.getValue(groupedCollection[key], 'sum');
            obj.child = groupedCollection[key];

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

    getValueBoolean(connections: any[], value: string): boolean {
        let returnValue = false;
        connections.forEach(element => {
            if (element[value]) {
                returnValue = true;
            } else {
                returnValue = false;
            }
        });

        return returnValue;
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
        this.JSONToCSVConvertor(this.csvList, title, true);
    }

    gotoEmployee(id: string): void {
        this.router.navigate(['/employee', id]);
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
}
