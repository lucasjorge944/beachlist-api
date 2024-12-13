import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { PlanType } from "../../../domain/entity";
import { IPlanRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class CreatePlanUseCase implements Usecase {
    constructor(readonly planRepository: IPlanRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const plan = await this.planRepository.getByName(input.plan.name);
        if (plan) throw new Error("Plan already exists");
        const response = await this.planRepository.create(input.plan);
        return response;
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isString(["plan.name", "plan.description"]);
        checker.isNumber(["plan.price"]);
    }
}

type Input = {
    plan: PlanType;
};

type Output = { _id: string };
