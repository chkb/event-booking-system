import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as moment from 'moment';
import { EventObject, EventHistory, Payout } from '../../shared/event';
import { Employee } from '../../shared/employee';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { moveIn } from '../../router.animations';

export class PayoutDanish {
    Medarbejder: string;
    Dato: string;
    Event: string;
    Takst: number;
    Timer: number;
    Bonus: number;
    Sum: number;
}

declare function escape(s: string): string;
@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventAdminComponent implements OnInit {
    list: PayoutDanish[] = [];
    eventList: EventObject[] = [];
    startDate = new FormControl((new Date()).toISOString());
    endDate = new FormControl((new Date()).toISOString());


    constructor(
        private afs: AngularFirestore,
        private datepipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.getEmployeedata();
    }

    generateTemp() {
        this.setList();
    }

    getEmployeedata(): void {
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

    setList(): void {
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
            }
        });
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

        let fileName = 'MyReport_';
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
