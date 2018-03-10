import { Employee } from './employee';
import { EventType } from './event-type';

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
    eventLeader: Employee;
    staffNeed: number;
    booked: Employee[];
    maybe: Employee[];
    nogo: Employee[];
    agenda: string;
    customer: string;
    contactInfo: string;
    eventType: string;
    eventTypeColor: string;
    bookingDone: boolean;
    payoutDone: boolean;
}
