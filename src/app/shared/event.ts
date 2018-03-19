import { Employee } from './employee';
import { EventType } from './event-type';
import { Wager } from './wager';

export class EventObject {
    uid: string;
    name: string;
    dateFrom: Date;
    dateTo: Date;
    timeFrom = '18:00';
    timeTo = '22:00';
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
    booked: Booked[] = [];
    maybe: Booked[] = [];
    nogo: Booked[] = [];
    agenda: string;
    customer: string;
    contactInfo: string;
    eventType: string;
    eventTypeColor: string;
    bookingDone: boolean;
    payoutDone: boolean;
    deative: boolean;
    payouts: Payout[] = [];
}

export class Payout {
    timeFrom: string;
    timeTo: string;
    hours: number;
    wager: number;
    bonus: number;
    sum: number;
    employee: Booked;
}

export class Booked extends Employee {
    comments: number;
}
