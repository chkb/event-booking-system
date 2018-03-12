import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import { Employee } from '../../shared/employee';
import { EventObject, Payout } from '../../shared/event';
import { Wager } from '../../shared/wager';
import { debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.less']
})
export class PayoutEditComponent implements OnInit {
    selectedPayoutList: Payout[] = [];
    selectedEvent: EventObject;
    tempWagerList: Wager[] = [];
    eventId: string;
    wagerList: any[];
    dataSource: MatTableDataSource<Payout>;
    updateEvent: Subject<boolean> = new Subject<boolean>();
    displayedColumns = [
        'employee',
        'timeFrom',
        'timeTo',
        'hours',
        'wager',
        'bonus',
        'sum',
        'selection'
    ];
    constructor(
        private route: ActivatedRoute,
        private afs: AngularFirestore,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.eventId = params['id'];
            this.afs
                .collection('events')
                .doc(this.eventId)
                .valueChanges()
                .subscribe((result: EventObject) => {
                    this.selectedEvent = result;
                    this.selectedPayoutList = this.selectedEvent.payouts;
                    this.dataSource = new MatTableDataSource(this.selectedPayoutList);
                    this.getWagerData();
                });
        });
        this.updateEvent.debounceTime(1000).subscribe((res: boolean) => {
            if (res) {
                this.update();
            }
        });
    }

    addToPayout(employee: Employee): void {
        const payout = new Payout();
        payout.employee = employee;
        payout.timeFrom = this.selectedEvent.timeFrom;
        payout.timeTo = this.selectedEvent.timeTo;
        payout.hours = this.getHours(payout.timeFrom, payout.timeTo);
        if (employee.personalWager) {
            payout.sum = this.getSum(payout.hours, employee.personalWager);
            payout.wager = employee.personalWager;
            const idx = this.tempWagerList.findIndex(x => x.value === employee.personalWager);
            const wagerObject = {
                name: 'Personligt løn-niveau',
                wager: [this.tempWagerList[idx]]
            };
            this.wagerList.push(wagerObject);
        }
        this.selectedPayoutList.push(payout);
        this.dataSource = new MatTableDataSource(this.selectedPayoutList);
        this.update();
    }

    getSum(time: number, wager: number, bonus: number = 0): number {
        const sum = (time * wager) + bonus;

        return sum;
    }

    getHours(timeFrom: string, timeTo: string): number {
        const result = 0;
        const from = this.toSeconds(timeFrom);
        const to = this.toSeconds(timeTo);
        let diff = Math.abs(to - from);
        if (to < from) {
            console.log('yes!');
            diff = Math.abs(from - this.toSeconds('24:00'));
            diff = diff + Math.abs(this.toSeconds('00:00') - to);
        }

        const h = Math.floor(diff / 3600);
        const m = Math.round(Math.floor(diff % 3600 / 60) * 0.0166666667 * 100) / 100;
        const time = h + m;


        return time;
    }

    toSeconds(time: string): number {
        const parts = time.split(':');
        const hour = Number(parts[0]);
        const minutes = Number(parts[1]);

        return hour * 3600 + minutes * 60;
    }

    getWagerData(): void {
        this.wagerList = [];
        this.tempWagerList = [];
        this.afs.collection('wagers').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterSkill = new Wager();
                masterSkill.name = doc.data()['name'];
                masterSkill.value = doc.data()['value'];
                masterSkill.uid = doc.id;
                this.tempWagerList.push(masterSkill);
            });
            const wagerObject = {
                name: 'Andre løn-niveau',
                wager: this.tempWagerList
            };
            this.wagerList.push(wagerObject);
        });
    }

    updatePayout(payout: Payout): void {
        payout.sum = this.getSum(payout.hours, payout.wager, payout.bonus);
        payout.hours = this.getHours(payout.timeFrom, payout.timeTo);
        const idx = this.selectedPayoutList.findIndex(x => x.employee === payout.employee && x.hours === payout.hours);
        this.selectedPayoutList[idx] = payout;
        this.dataSource = new MatTableDataSource(this.selectedPayoutList);
        this.updateEvent.next(true);
    }

    removePayout(payout: Payout): void {
        const idx = this.selectedPayoutList.findIndex(x => x.employee === payout.employee && x.hours === payout.hours);
        this.selectedPayoutList.splice(idx, 1);
        this.dataSource = new MatTableDataSource(this.selectedPayoutList);
        this.updateEvent.next(true);
    }

    update(): void {
        this.selectedEvent.payouts = this.selectedPayoutList;
        this.afs
            .collection('events')
            .doc(this.eventId)
            .update(JSON.parse(JSON.stringify(this.selectedEvent)))
            .then(() => {
                this.snackBar.open('Begivenhed opdateret', 'LUK',
                    {
                        duration: 10000,
                    });
            });
    }
}
