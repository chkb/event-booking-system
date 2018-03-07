import { Employee } from './employee';

export class EventObject {
    uid: string;
    name: string;
    dateFrom: Date;
    dateTo: Date;
    timeFrom: Date;
    timeTo: Date;
    billInfo: number;
    language: string;
    eventDescription: string;
    internalComment: string;
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

}
