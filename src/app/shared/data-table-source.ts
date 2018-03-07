import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Rx';
import { Employee } from './employee';
import { AngularFirestore } from 'angularfire2/firestore';
import { MatSort } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

export class DataTableSource extends DataSource<any> {
    /** Connect function called by the table to retrieve one stream containing the data to render. */
    constructor(private angularFirestore: AngularFirestore, private _sort: MatSort) {
        super();
    }
    private employeeList: Employee[] = [];
    private filterChange: BehaviorSubject<boolean>;

    setData(employeeList: Employee[]): void {
        this.employeeList = employeeList;
    }

    set filter(input: boolean) {
        this.filterChange.next(input);
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Employee[]> {
        const displayDataChanges = [
            this._sort.sortChange,
            this.connect
        ];

        return Observable.merge(...displayDataChanges).map(() => {
            return this.getSortedData();
        });
    }

    disconnect() { }

    /** Returns a sorted copy of the database data. */
    getSortedData(): Employee[] {
        const data = this.employeeList.slice();
        if (!this._sort.active || this._sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number | string = '';
            let propertyB: number | string = '';

            switch (this._sort.active) {
                case 'displayName': [propertyA, propertyB] = [a.displayName, b.displayName]; break;
                case 'email': [propertyA, propertyB] = [a.email, b.email]; break;
                case 'uid': [propertyA, propertyB] = [a.uid, b.uid]; break;
            }

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
        });
    }
}
