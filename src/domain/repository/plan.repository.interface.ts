import Plan, { PlanType } from "../entity/plan.entity";

export interface IPlanRepository {
    getAll(): Promise<{ total: number; plans: Plan[] }>;
    create(plan: PlanType): Promise<{ _id: string }>;
    getByName(name: string): Promise<Plan | null>;
}
