export class MasterSkill {
    uid: string;
    name: string;
    order: number;
    onlyAdminEdit: boolean;
    hasRating: boolean;
    ratingValue1: string;
    ratingValue2: string;
    ratingValue3: string;
    skills: string[] = [];
}
export class SkillExtended {
    name: string;
    rankValue: number;
}

export class MasterSkillExtended {
    uid: string;
    name: string;
    order: number;
    onlyAdminEdit: boolean;
    hasRating: boolean;
    ratingValue1: string;
    ratingValue2: string;
    ratingValue3: string;
    skills: string[] = [];
    selectedSkills: SkillExtended[] = [];
}
