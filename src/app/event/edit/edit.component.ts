import { animate, Component, OnInit, state, style, transition, trigger } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { AngularFirestore } from 'angularfire2/firestore';

import * as moment from 'moment';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { LocalStorageService } from '../../localstorage.service';
import { moveIn } from '../../router.animations';
import { Employee, Skill } from '../../shared/employee';
import { EventObject, Booked, EventHistory } from '../../shared/event';
import { EventType } from '../../shared/event-type';
import { Role } from '../../shared/role';
import { MasterSkillExtended, SkillExtended } from '../../shared/skill';
import { EmployeeDialogComponent } from '../../employee-dialog/employee-dialog.component';
import { debounce } from 'rxjs/operator/debounce';
import { Subject } from 'Rxjs';
import { LoginProviderService } from '../../core/login-provider.service';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.less'],
    animations: [
        moveIn(),
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
            state('expanded', style({ height: '*', visibility: 'visible' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ])],
    // tslint:disable-next-line:use-host-property-decorator
    host: { '[@moveIn]': '' }
})
export class EventEditComponent implements OnInit {
    debounceUpdate: Subject<boolean> = new Subject<boolean>();
    selectedEvent: EventObject;
    eventId: string;
    // searchFilterBucket: string[] = [];
    masterskills: MasterSkillExtended[] = [];
    searchFilterBucket: Skill[] = [];
    showFilters: boolean;
    minDate = new Date().toISOString();
    minDate2 = new Date().toISOString();
    skillList: SkillExtended[] = [];
    event: EventObject = new EventObject();
    eventTypeList: EventType[] = [];
    selectedBookedList: Booked[] = [];
    selectedMaybeList: Booked[] = [];
    selectedNogoList: Booked[] = [];
    generalEmployeeList: Booked[] = [];
    leaderList: Booked[] = [];
    employeeBlackList: string[] = [];
    emailList: string;
    copied = false;
    timeFrom: string;
    timeTo: string;
    displayedColumns = [
        'role',
        'displayName',
        'email',
        'mobile',
        'hasDriverLicens',
        'hasCar',
        'selection'
    ];

    bookedColumns = [
        'role',
        'displayName',
        'email',
        'mobile',
        'hasDriverLicens',
        'hasCar',
        'bookingComment',
        'selection'
    ];
    dataSource: MatTableDataSource<Booked>;
    bookedSource: MatTableDataSource<Booked>;
    maybeSource: MatTableDataSource<Booked>;
    nogoSource: MatTableDataSource<Booked>;
    private readonly localstorageSkillListKey: string = 'search_skill_list';

    isExpansionDetailRow = (i, row) => row.hasOwnProperty('detailRow');
    // tslint:disable-next-line:member-ordering
    expandedElement: any;

    constructor(
        private route: ActivatedRoute,
        private afs: AngularFirestore,
        private router: Router,
        private localStorageService: LocalStorageService,
        private atp: AmazingTimePickerService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
        private lps: LoginProviderService
    ) {
        afs.firestore.settings({ timestampsInSnapshots: true });        
    }

    getEmployeeData(): void {
        const employeeList: Booked[] = [];
        this.afs.collection('users').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const employee = new Booked();
                employee.displayName = doc.data()['displayName'];
                employee.email = doc.data()['email'];
                employee.photoURL = doc.data()['photoURL'];
                employee.uid = doc.id;
                employee.role = doc.data()['role'];
                employee.skills = doc.data()['skills'];
                employee.mobile = doc.data()['mobile'];
                employee.hasCar = doc.data()['hasCar'];
                employee.personalWager = doc.data()['personalWager'];
                employee.hasDriverLicens = doc.data()['hasDriverLicens'];
                if (this.searchFilterBucket.length) {
                    let count = 0;
                    this.searchFilterBucket.forEach(skill => {
                        if (employee.skills && employee.skills.length && this.isInArray(employee.skills, skill)) {
                            count++;
                        }
                    });
                    if (count) {
                        employeeList.push(employee);
                    }
                } else {
                    employeeList.push(employee);
                }
            });
            this.generalEmployeeList = employeeList;
            this.getListOfLeaders(employeeList);
            this.setDataTableData();
            this.getFilterData();
        });
    }

    setDataTableData(): void {
        const tempList: Booked[] = [];
        this.generalEmployeeList.forEach(employee => {
            if (!this.isBlacklisted(employee.uid)) {
                tempList.push(employee);
            }
        });

        this.generalEmployeeList = tempList;
        this.dataSource = new MatTableDataSource(tempList);
    }

    isBlacklisted(uid: string): boolean {
        let result = false;
        this.employeeBlackList.forEach(blacklistedEmployeeIds => {
            if (blacklistedEmployeeIds === uid) {
                result = true;
            }
        });

        return result;

    }

    getListOfLeaders(employeeList: Booked[]): void {
        employeeList.forEach(employee => {
            if (employee.role === 'admin' || employee.role === 'eventLeader') {
                this.leaderList.push(employee);
            }
        });
    }

    updateArray(employeeList: Booked[]): void {
        employeeList.forEach(employee => {
            this.removeInPlace(this.generalEmployeeList, employee);
        });

        this.dataSource = new MatTableDataSource(this.generalEmployeeList);
    }

    bookEmployee(employee: Booked): void {
        this.selectedBookedList.push(employee);
        this.selectedEvent.booked = this.selectedBookedList;
        this.update(false);
        this.updateArray(this.selectedBookedList);
        this.getEmailList();
        this.updateEventHistory(employee);
    }

    openEmployeeDialog(employeeId: string): void {
        const dialogRef = this.dialog.open(EmployeeDialogComponent,
            {
                data: {
                    employeeId: employeeId
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {

            }
        });
    }

    updateComment(employee: Booked, comment: string) {
        employee.comment = comment;
        this.updateEventHistory(employee, false);
    }

    updateEventHistory(employee: Booked, showSnackbar: boolean = true): void {
        const eventHistory = new EventHistory();
        eventHistory.comments = employee.bookingComment;
        eventHistory.employeeName = employee.displayName;
        eventHistory.employeeUid = employee.uid;
        eventHistory.eventName = this.selectedEvent.name;
        eventHistory.eventUid = this.eventId;
        eventHistory.date = this.selectedEvent.dateFrom;
        const year = moment().year().toString();

        this.afs
            .collection(`event-history`)
            .doc(employee.uid)
            .collection(year)
            .doc(this.eventId)
            .set(JSON.parse(JSON.stringify(eventHistory)))
            .then(res => {
                if (showSnackbar) {
                    this.snackBar.open('Booking oprettet', 'LUK',
                        {
                            duration: 10000,
                        });
                }
            });
        this.updateBookedList();
    }

    removeBookedEmployee(employee: Booked): void {
        this.removeInPlace(this.selectedBookedList, employee);
        this.generalEmployeeList.push(employee);
        this.dataSource = new MatTableDataSource(this.generalEmployeeList);
        this.getEmailList();
        this.updateBookedList();
    }

    maybeEmployee(employee: Booked): void {
        this.selectedMaybeList.push(employee);
        this.selectedEvent.maybe = this.selectedMaybeList;
        this.update(false);
        this.updateArray(this.selectedMaybeList);
    }

    removeMaybeEmployee(employee: Booked): void {
        this.removeInPlace(this.selectedMaybeList, employee);
        this.generalEmployeeList.push(employee);
        this.dataSource = new MatTableDataSource(this.generalEmployeeList);
        this.updateMaybeList();
    }

    nogoEmployee(employee: Booked): void {
        this.selectedNogoList.push(employee);
        this.selectedEvent.nogo = this.selectedNogoList;
        this.update(false);
        this.updateArray(this.selectedNogoList);
    }

    removeNogoEmployee(employee: Booked): void {
        this.removeInPlace(this.selectedNogoList, employee);
        this.generalEmployeeList.push(employee);
        this.dataSource = new MatTableDataSource(this.generalEmployeeList);
        this.updateNogoList();
    }

    geteventTypeList(): void {
        this.eventTypeList = [];
        this.afs.collection('event-types').ref.get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const masterSkill = new EventType();
                masterSkill.name = doc.data()['name'];
                masterSkill.color = doc.data()['color'];
                masterSkill.uid = doc.id;
                this.eventTypeList.push(masterSkill);
            });
        });
    }

    ngOnInit() {
        this.getEventData();
        this.getEmployeeData();
        this.geteventTypeList();
        this.debounceUpdate.debounceTime(2000).subscribe(res => {
            if (res) {
                this.update(false);
            }
        });
    }

    updateBookedList(): void {
        this.bookedSource = new MatTableDataSource(this.selectedBookedList);
    }

    updateMaybeList(): void {
        this.maybeSource = new MatTableDataSource(this.selectedMaybeList);
    }

    updateNogoList(): void {
        this.nogoSource = new MatTableDataSource(this.selectedNogoList);
    }

    getEventData(): void {
        this.route.params.subscribe(params => {
            this.eventId = params['id'];
            this.afs
                .collection('events')
                .doc(this.eventId)
                .valueChanges()
                .subscribe((result: EventObject) => {
                    this.selectedEvent = result;
                    this.timeFrom = this.selectedEvent.timeFrom;
                    this.timeTo = this.selectedEvent.timeTo;
                    if (this.selectedEvent.booked) {
                        this.selectedBookedList = this.selectedEvent.booked;
                        this.selectedBookedList.forEach(employee => {
                            this.employeeBlackList.push(employee.uid);
                        });
                        this.updateBookedList();
                        this.getEmailList();
                    }
                    if (this.selectedEvent.maybe) {
                        this.selectedMaybeList = this.selectedEvent.maybe;
                        this.updateMaybeList();
                        this.selectedMaybeList.forEach(employee => {
                            this.employeeBlackList.push(employee.uid);
                        });
                    }
                    if (this.selectedEvent.nogo) {
                        this.selectedNogoList = this.selectedEvent.nogo;
                        this.updateNogoList();
                        this.selectedNogoList.forEach(employee => {
                            this.employeeBlackList.push(employee.uid);
                        });
                    }
                });
        });
    }

    isInArray(array, value) {
        return array.indexOf(value) > -1;
    }

    removeInPlace(array, item) {
        let foundIndex, fromIndex;

        // Look for the item (the item can have multiple indices)
        fromIndex = array.length - 1;
        foundIndex = array.lastIndexOf(item, fromIndex);

        while (foundIndex !== -1) {
            // Remove the item (in place)
            array.splice(foundIndex, 1);

            // Bookkeeping
            fromIndex = foundIndex - 1;
            foundIndex = array.lastIndexOf(item, fromIndex);
        }

        // Return the modified array
        return array;
    }

    updateWithDebounce() {
        this.debounceUpdate.next(true);
    }

    update(navigate: boolean): void {
        this.afs
            .collection('events')
            .doc(this.eventId).update(JSON.parse(JSON.stringify(this.selectedEvent))).then(() => {
                this.snackBar.open('Begivenhed opdateret', 'LUK',
                    {
                        duration: 10000,
                    });
                if (navigate) {
                    this.router.navigate([`/event/list`]);
                }
            });
    }

    delete(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent,
            {
                data: {
                    text: 'Dette er en permanent sletning af begivenhed, er du sikker på du vil slette denne begivenhed?',
                    title: `Vil du slette ${this.selectedEvent.name}`,
                    cancelButtonText: 'ANNULLER',
                    confirmButtonText: 'SLET BEGIVENHED'
                }
            });

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.afs
                    .collection('events')
                    .doc(this.eventId).delete().then(() => {
                        this.snackBar.open('Begivenhed slettet', 'LUK',
                            {
                                duration: 10000,
                            });
                        this.router.navigate([`/event/list`]);
                    });
            }
        });
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    bookingDone(): void {
        this.selectedEvent.bookingDone = !this.selectedEvent.bookingDone;
        this.update(false);
    }

    payoutDone(): void {
        this.selectedEvent.payoutDone = !this.selectedEvent.payoutDone;
        this.update(false);
    }

    getFilterData(): void {
        const localstorageSkillList = this.localStorageService.getItem<MasterSkillExtended[]>(this.localstorageSkillListKey);
        if (localstorageSkillList && localstorageSkillList.length) {
            this.masterskills = [];
            this.masterskills = localstorageSkillList;
            this.filterEmployeeData();
        } else {
            this.afs.collection('masterSkills').ref.get().then(querySnapshot => {
                querySnapshot.forEach(doc => {
                    const masterskill = new MasterSkillExtended();
                    masterskill.name = doc.data()['name'];
                    masterskill.hasRating = doc.data()['hasRating'];
                    masterskill.onlyAdminEdit = doc.data()['onlyAdminEdit'];
                    masterskill.ratingValue1 = doc.data()['ratingValue1'];
                    masterskill.ratingValue2 = doc.data()['ratingValue2'];
                    masterskill.ratingValue3 = doc.data()['ratingValue3'];
                    masterskill.skills = doc.data()['skills'];
                    masterskill.order = doc.data()['order'];
                    masterskill.uid = doc.id;
                    this.masterskills.push(masterskill);
                });
            });
            this.masterskills.sort((a, b) => a.order - b.order);
        }
    }

    selectFilter(masterSkillId: string, skillName: string, rankingValue: number) {
        const idx = this.masterskills.findIndex(x => x.uid === masterSkillId);
        const selectedSkill = new SkillExtended();
        selectedSkill.name = skillName;
        selectedSkill.rankValue = rankingValue;
        const hasDuplicates = this.containsDuplicate(this.masterskills[idx].selectedSkills, selectedSkill)
        if(hasDuplicates){
            this.masterskills[idx].selectedSkills.forEach(item => {
                if(item.name === skillName && item.rankValue !== rankingValue){
                    const idx2 = this.masterskills[idx].selectedSkills.indexOf(item);
                    this.masterskills[idx].selectedSkills.splice(idx2, 1);
                }
            })
        }
        if (this.masterskills[idx].selectedSkills) {
            const isInArray = this.containsObject(this.masterskills[idx].selectedSkills, selectedSkill);
            if (isInArray) {
                const idx2 = this.masterskills[idx].selectedSkills.indexOf(selectedSkill);
                this.masterskills[idx].selectedSkills.splice(idx2, 1);

            } else {
                this.masterskills[idx].selectedSkills.push(selectedSkill);
            }
        } else {
            this.masterskills[idx].selectedSkills.push(selectedSkill);
        }
        this.localStorageService.setItem(this.localstorageSkillListKey, this.masterskills);
        this.filterEmployeeData();
    }

    filterEmployeeData(): void {
        const list: SkillExtended[] = [];
        let employeelist: Booked[] = [];
        this.masterskills.forEach(masterSkill => {
            masterSkill.selectedSkills.forEach(skill => {
                list.push(skill);
            });
        });

        this.generalEmployeeList.forEach(employee => {
            list.forEach(skill => {
                let hasSkill = false;
                if (employee.skills) {
                    employee.skills.forEach(eSkill => {
                        const tempSkills: SkillExtended[] = [];
                        if (!this.containsEmployeeObject(employeelist, employee)) {
                            if (skill.rankValue && eSkill.name === skill.name && eSkill.ranking >= skill.rankValue) {
                                hasSkill = true;
                            }
                        } else {
                            if (this.containsEmployeeObject(employeelist, employee)) {
                                const idx = employeelist.findIndex(x => x.uid === employee.uid);
                                employeelist.splice(idx, 1);
                                hasSkill = false;
                            }
                        }
                    });
                }
                if (hasSkill) {
                    employeelist.push(employee);
                } else {
                    if (employeelist.length) {
                        employeelist = this.removeInPlace(employeelist, employee);
                    }
                }
            });
        });
        if (list.length) {
            this.dataSource = new MatTableDataSource(employeelist);
        } else {
            this.dataSource = new MatTableDataSource(this.generalEmployeeList);
        }
    }

    containsEmployeeObject(employeeList: Booked[], employee: Booked): boolean {
        let result = false;
        employeeList.forEach(item => {
            if (item.uid === employee.uid) {
                result = true;
            }
        });

        return result;
    }

    containsObject(skillExtendedList: SkillExtended[], skillExtended: SkillExtended): boolean {
        let result = false;
        skillExtendedList.forEach(item => {
            if (skillExtended.rankValue) {
                if (item.name === skillExtended.name && item.rankValue === skillExtended.rankValue) {
                    result = true;
                }
            } else {
                if (item.name === skillExtended.name) {
                    result = true;
                }
            }
        });

        return result;
    }

    containsDuplicate(skillExtendedList: SkillExtended[], skillExtended: SkillExtended): boolean {
        let result = false;
        let count = 0;
        skillExtendedList.forEach(item => {
            if(item.name === skillExtended.name){
                count ++;
            }
        });
        result = count  >= 1 ? true : false;

        return result;
    }


    ifFilterisSelected(masterSkill: MasterSkillExtended, skillName: string, rankingValue?: number): boolean {
        let result = false;
        masterSkill.selectedSkills.forEach(skill => {
            if (rankingValue) {
                if (skill.name === skillName && skill.rankValue >= rankingValue) {
                    result = true;
                }
            } else {
                if (skill.name === skillName) {
                    result = true;
                }
            }
        });

        return result;
    }

    getRoleText(value: string): string {
        if (!value) {
            return 'Ingen rolle angivet';
        }
        const roleText = Role[value];

        return roleText;
    }

    getEmailList(): void {
        let string = '';
        this.selectedBookedList.forEach(employee => {
            string = `${string}${employee.email};`;
        });

        this.emailList = string;
    }

    goToPayout(): void {
        this.router.navigate([`/payout`, this.eventId]);
    }

    deativate(): void {
        if (this.selectedEvent.deative) {
            this.selectedEvent.deative = false;
            this.update(false);
        } else {
            const dialogRef = this.dialog.open(ConfirmDialogComponent,
                {
                    data: {
                        text: 'Vil du deaktivere dette event?, den vil ikke fremgå nogen liste, men vil stadig blive gemt i databasen?',
                        title: `Vil du deaktivere ${this.selectedEvent.name}`,
                        cancelButtonText: 'ANNULLER',
                        confirmButtonText: 'DEAKTIVERE EVENT'
                    }
                });

            dialogRef.afterClosed().subscribe((result: boolean) => {
                if (result) {
                    this.selectedEvent.deative = true;
                    this.update(true);
                }
            });
        }
    }

    isAdminOrEventLeader() {
        if (this.lps.role === 'admin' || this.lps.role === 'eventLeader') {
            return true;
        }

        return false;
    }
}
