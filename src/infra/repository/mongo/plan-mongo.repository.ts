import { Collection, Db } from "mongodb";
import { PlanType } from "../../../domain/entity";
import { IPlanRepository } from "../../../domain/repository/plan.repository.interface";
import Plan from "../../../domain/entity/plan.entity";

export class PlanMongoRepository implements IPlanRepository {
    private collection: Collection<PlanType>;
    constructor(readonly mongoDb: Db) {
        this.collection = this.mongoDb.collection("plans");
    }

    public async getAll(): Promise<{ total: number; plans: Plan[] }> {
        const data = await this.collection.find({}).toArray();
        if (!data?.length) return { total: 0, plans: [] };
        const plans = data.map((plan: PlanType) =>
            Plan.restore(plan, plan._id)
        );
        return { total: plans?.length, plans };
    }

    public async create(plan: PlanType): Promise<{ _id: string }> {
        const response = await this.collection.insertOne(plan);
        return { _id: response.insertedId.toString() };
    }

    public async getByName(name: string): Promise<Plan | null> {
        const plan = await this.collection.findOne({ name });
        if (!plan) return null;
        return Plan.restore(plan, plan._id);
    }
}
