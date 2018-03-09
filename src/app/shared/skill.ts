export class MasterSkill {
    uid: string;
    name: string;
    onlyAdminEdit: boolean;
    hasRating: boolean;
    ratingValue1: string;
    ratingValue2: string;
    ratingValue3: string;
    skills: string[] = [];
}
export class SkillExtended {
    uid: string;
    name: string;
    selected: boolean;
}
