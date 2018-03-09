import { Employee } from './employee';

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
}
