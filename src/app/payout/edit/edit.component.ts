import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
// tslint:disable-next-line:import-blacklist
import { Subject } from 'rxjs';
import * as moment from 'moment';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LoginProviderService } from '../../core/login-provider.service';
import { OrderByPipe } from '../../order-by.pipe';
import { moveIn } from '../../router.animations';
import { Booked, EventObject, Payout, PayoutVM } from '../../shared/event';
import { Wager } from '../../shared/wager';
import { Employee } from '../../shared/employee';

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
        'comment',
        'sum',
        'selection'
    ];
    constructor(
        private route: ActivatedRoute,
        private afs: AngularFirestore,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private router: Router,
        private lps: LoginProviderService,
        private orderByPipe: OrderByPipe
    ) {
    }

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
                        console.log(this.selectedEvent.payouts);
                        this.selectedPayoutList = this.getPayoutVmObject(this.selectedEvent.payouts);
                    }
                    this.updateTable();
                    this.getWagerData();
                });
        });
    }

    getPayoutVmObject(payouts: Payout[]): PayoutVM[] {
        const payoutVms = payouts.map(payout => {
            const payoutVm = new PayoutVM();
            payoutVm.employeeName = payout.employee.displayName;
            payoutVm.employee = payout.employee;
            payoutVm.dateFrom = payout.dateFrom;
            payoutVm.dateTo = payout.dateTo;
            payoutVm.hours = payout.hours;
            payoutVm.sum = payout.sum;
            payoutVm.bonus = payout.bonus;
            payoutVm.comment = payout.comment;
            payoutVm.wager = payout.wager;
            return payoutVm;
        });

        return payoutVms;
    }

    addToPayout(employee: Booked): void {
        this.afs
            .collection('users')
            .doc(employee.uid)
            .valueChanges()
            .subscribe((result: Employee) => {
                const payout = new PayoutVM();
                payout.employeeName = result.displayName;
                payout.employee = employee;
                payout.dateFrom = this.selectedEvent.dateFrom;
                payout.dateTo = this.selectedEvent.dateTo;
                payout.hours = this.getHours(payout.dateFrom, payout.dateTo);
                if (result.personalWager) {
                    const wager = new Wager();
                    wager.name = result.displayName;
                    wager.value = result.personalWager;
                    payout.sum = this.getSum(payout.hours, result.personalWager);
                    payout.wager = result.personalWager;
                    const wagers: Wager[] = [];
                    wagers.push(wager);
                }
                this.selectedPayoutList.push(payout);
                this.updateTable();
                this.update();
            });
    }

    updateTable(): void {
        if (this.selectedPayoutList.length) {
            this.selectedPayoutList = this.orderByPipe.transform(this.selectedPayoutList, 'employeeName', true);
            this.dataSource = new MatTableDataSource(this.selectedPayoutList);
        }
    }

    getSum(time: number, wager: number, bonus: number = 0): number {
        const sum = (time * wager) + bonus;

        return sum;
    }

     
/*
     getHours(dateFrom: string, dateTo: string): number {
       const result = 0;

       const from = this.event.dateFrom.getHours();
     }


*/


/*
    getHours(dateFrom: string, dateTo: string): number {
        const result = 0;
        const from = this.toSeconds(dateFrom);
        const to = this.toSeconds(dateTo);
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
   
   */
    
   
                
                 

    
    getHours(dateFrom: Date, dateTo: Date): number {
        
        const end = moment(dateTo);
        const start = moment(dateFrom);
        const duration = moment.duration(end.diff(start));
        const hours = duration.asHours();
        const hoursDecimal = Math.round(hours * 100) / 100;
    
        return hoursDecimal ;

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

    checkIfOverlap(payout: Payout): boolean {
        this.selectedPayoutList.forEach(selected => {
            if (selected.employee.uid === payout.employee.uid) {
                if (selected.dateFrom < payout.dateFrom && payout.dateFrom < selected.dateTo) {
                    return true;
                }
            }
        })
        return false;
    }


    // check this out
    updatePayout(payout: Payout): void {
        if (this.checkIfOverlap(payout)) {
            console.log('overlap');
            return;
        }
        payout.hours = this.getHours(payout.dateFrom, payout.dateTo);
        payout.sum = this.getSum(payout.hours, payout.wager, payout.bonus);
        const idx = this.selectedPayoutList.findIndex(x => x.employee === payout.employee && x.hours === payout.hours);
        this.selectedPayoutList[idx] = payout;
        this.updateTable();

    }

    removePayout(payout: Payout): void {
        if (this.selectedPayoutList.length > 1) {
            const idx = this.selectedPayoutList.findIndex(x => x.employee === payout.employee && x.hours === payout.hours);
            this.selectedPayoutList.splice(idx, 1);
            this.updateTable();
        } else {
            this.selectedPayoutList = [];
            this.dataSource = new MatTableDataSource(this.selectedPayoutList);
        }
        this.updateEvent.next(true);
        this.update();
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
                this.router.navigate([`/event/list`]);
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
