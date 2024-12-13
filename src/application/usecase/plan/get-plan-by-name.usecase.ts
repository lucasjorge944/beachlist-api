import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { PlanType } from "../../../domain/entity";
import { IPlanRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class GetPlanByNameUseCase implements Usecase {
    constructor(readonly planRepository: IPlanRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const plan = await this.planRepository.getByName(input.name);
        if (!plan) throw new Error("Plan not found");
        return { plan: plan.toJSON() };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isString(["name"]);
    }
}

type Input = {
    name: string;
};

type Output = { plan: PlanType };
