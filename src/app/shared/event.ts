import { Employee } from './employee';
import { EventType } from './event-type';
import { Wager } from './wager';

export class EventObject {
    uid: string;
    name: string;
    dateFrom: Date;
    dateTo: Date;
    timeFrom: string;
    timeTo: string;
    billInfo = '';
    language: string;
    eventDescription: string;
    internalComment: string;
    teamComment: string;
    eventLocation: string;
    eventAdress: string;
    meetingLocation: string;
    meetingAdress: string;
    eventLeader: string;
    eventLeaderId: string;
    staffNeed: number;
    booked: Employee[] = [];
    maybe: Employee[] = [];
    nogo: Employee[] = [];
    agenda: string;
    customer: string;
    contactInfo: string;
    eventType: string;
    eventTypeColor: string;
    bookingDone: boolean;
    payoutDone: boolean;
    payouts: Payout[] = [];
}

export class Payout {
    timeFrom: string;
    timeTo: string;
    hours: number;
    wager: number;
    bonus: number;
    sum: number;
    employee: Employee;
}
