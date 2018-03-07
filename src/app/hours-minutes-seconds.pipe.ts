import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hoursMinutesSeconds' })
export class HoursMinutesSecondsPipe implements PipeTransform {
    constructor() { }

    transform(seconds: number): string {
        if (seconds < 0) {
            throw new Error(`Input for pipe cannot be negative (was ${seconds})`);
        }

        const hoursPart = Math.floor(seconds / (60 * 60));
        const theRest = seconds - hoursPart * (60 * 60);
        const minutesPart = Math.floor(theRest / 60);
        const secondsPart = theRest - minutesPart * 60;

        const parts = [];

        if (hoursPart > 0) {
            parts.push(`${hoursPart}t`);
        }

        if (hoursPart > 0 || minutesPart > 0) {
            parts.push(`${minutesPart}m`);
        }

        parts.push(`${secondsPart}s`);

        const res = parts.join(' ');

        return res;
    }
}