import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-employee-dialog',
    templateUrl: './employee-dialog.component.html',
    styleUrls: ['./employee-dialog.component.css']
})
export class EmployeeDialogComponent {
    employeeId: string;

    constructor(
        private dialogRef: MatDialogRef<EmployeeDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        if (data) {
            this.employeeId = data.employeeId;
        }
    }

    close(): void {
        this.dialogRef.close(false);
    }

    agree(): void {
        this.dialogRef.close(true);
    }

}
