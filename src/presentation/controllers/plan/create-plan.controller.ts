import { Db } from "mongodb";
import { IController } from "../../protocols/controller.interface";
import { ok, serverError } from "../../protocols/http.helper";
import { HttpResponse } from "../../protocols/http.interface";
import { PlanMongoRepository } from "../../../infra/repository/mongo";
import { CreatePlanUseCase } from "../../../application/usecase/plan";

export class CreatePlanController implements IController {
    constructor(readonly mongoDb: Db) {}

    public async execute(request: any): Promise<HttpResponse> {
        try {
            const repository = new PlanMongoRepository(this.mongoDb);
            const usecase = new CreatePlanUseCase(repository);
            const plan = await usecase.execute(request);
            return ok(plan);
        } catch (error) {
            return serverError(error);
        }
    }
}
