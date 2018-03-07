import { Component, Inject, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
    title: string;
    text: string;
    cancelButtonText: string;
    confirmButtonText: string;

    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Optional() @Inject(MAT_DIALOG_DATA) private data: any
    ) {
        if (data) {
            this.title = data.title;
            this.text = data.text;
            this.cancelButtonText = data.cancelButtonText;
            this.confirmButtonText = data.confirmButtonText;
        }
    }

    close(): void {
        this.dialogRef.close(false);
    }

    agree(): void {
        this.dialogRef.close(true);
    }

}
