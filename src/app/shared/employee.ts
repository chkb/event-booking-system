import { Wager } from './wager';

export class Employee {
    displayName: string;
    email: string;
    photoURL: string;
    uid: string;
    comment: string;
    internalComment: string;
    mobile: string;
    workEmail: string;
    uniqueId: string;
    adress: string;
    postal: string;
    height: string;
    paymentMethod: string;
    payrollNumber: string;
    city: string;
    bankAccount: string;
    bankReg: string;
    hasDriverLicens: boolean;
    deactive: boolean;
    hasCar: boolean;
    contractSigned: boolean;
    newContractSigned: boolean;
    role: string;
    skills: Skill[] = [];
    personalWager: number;
    detailRow: boolean;
}

export class Skill {
    uid: string;
    name: string;
    ranking: number;
    ratingText: string;
    isOnlyadmin: boolean;
}
