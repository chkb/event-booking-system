import { Component, OnInit } from '@angular/core';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject } from 'Rxjs';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LoginProviderService } from '../../core/login-provider.service';
import { Booked, EventObject, Payout } from '../../shared/event';
import { Wager } from '../../shared/wager';
import { moveIn } from '../../router.animations';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.less'],
    animations: [moveIn()],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class PayoutEditComponent implements OnInit {
    selectedPayoutList: Payout[] = [];
    selectedEvent: EventObject;
    tempWagerList: Wager[] = [];
    eventId: string;
    wagerList: any[];
    tempWagerPersonal: any;
    dataSource: MatTableDataSource<Payout>;
    updateEvent: Subject<boolean> = new Subject<boolean>();
    displayedColumns = [
        'employee',
        'timeFrom',
        'timeTo',
        'hours',
        'wagerList',
        'wager',
        'bonus',
        'sum',
        'selection'
    ];
    constructor(
        private route: ActivatedRoute,
        private afs: AngularFirestore,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router,
        private lps: LoginProviderService
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
                    if (this.selectedEvent.payouts) {
                        this.selectedPayoutList = this.selectedEvent.payouts;
                    }
                    this.dataSource = new MatTableDataSource(this.selectedPayoutList);
                    this.getWagerData();
                });
        });
    }

    addToPayout(employee: Booked): void {
        const payout = new Payout();
        payout.employee = employee;
        payout.timeFrom = this.selectedEvent.timeFrom;
        payout.timeTo = this.selectedEvent.timeTo;
        payout.hours = this.getHours(payout.timeFrom, payout.timeTo);
        if (employee.personalWager) {
            const wager = new Wager();
            wager.name = employee.displayName;
            wager.value = employee.personalWager;
            payout.sum = this.getSum(payout.hours, employee.personalWager);
            payout.wager = employee.personalWager;
            const wagers: Wager[] = [];
            wagers.push(wager);
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

    payoutDone(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: `Er du sikker på at du er færdig med at lønne registrere timer på medarbejder,
                    det er kun en administrator der kan åbne eventet op igen?`,
                    title: `Er du helt færdig med at lønne eventet '${this.selectedEvent.name}'`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'FÆRDIG MED LØNNING'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.selectedEvent.payoutDone = true;
                this.update();
                this.router.navigate([`/payout/list`]);
            }
        });
    }

    payoutOpen(): void {
        this.selectedEvent.payoutDone = false;
        this.update();
    }

    isAdmin() {
        if (this.lps.role === 'admin') {
            return true;
        }

        return false;
    }
}
