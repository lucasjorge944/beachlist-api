import Entity from "../../_shared/domain/entity/entity.abstract";

class Plan extends Entity<PlanType> {
    constructor(readonly props: PlanType, _id?: string) {
        super(props, _id);
    }

    static restore(props: PlanType, _id?: string): Plan {
        const entity = new Plan(props, _id);
        return entity;
    }
}

export type PlanType = {
    _id?: string;
    name: string;
    description: string;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export default Plan;
