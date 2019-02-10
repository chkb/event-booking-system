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
    bookedCount: number;
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
    payoutDoneBy: Employee;
    payouts: Payout[] = [];
    eventNumber: string;
    numberOfCustomer: string;
    numberOfTeam: string;
    timePlan: string;
    crew: string;
    eventLeaderInfo: string;
    timeline: string;
}

export class Payout {
    timeFrom: string;
    timeTo: string;
    hours: number;
    wager: number;
    bonus: number;
    comment: string;
    sum: number;
    employee: Booked;
    udbetalt: boolean;
}
export class PayoutVM {
    employeeName: string;
    timeFrom: string;
    timeTo: string;
    hours: number;
    wager: number;
    bonus: number;
    comment: string;
    sum: number;
    employee: Booked;
    udbetalt: boolean;
}

export class Booked extends Employee {
    bookingComment: string;
}

export class EventHistory {
    employeeUid: string;
    employeeName: string;
    eventUid: string;
    eventName: string;
    comments: string;
    date: Date;
}
export class EventHistoryViewModel {
    employeeUid: string;
    employeeName: string;
    eventUid: string;
    eventName: string;
    comments: string;
    date: Date;
    event: any;
}
