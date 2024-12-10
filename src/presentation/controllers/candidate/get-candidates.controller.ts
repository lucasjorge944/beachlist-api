import { Db } from "mongodb";
import { IController } from "../../protocols/controller.interface";
import { ok, serverError } from "../../protocols/http.helper";
import { HttpResponse } from "../../protocols/http.interface";
import { CandidateMongoRepository } from "../../../infra/repository/mongo";
import { GetCandidatesUseCase } from "../../../application/usecase/candidates/get-candidates.usecase";

export class GetCandidatesController implements IController {
    constructor(readonly mongoDb: Db) {}

    public async execute(request: any): Promise<HttpResponse> {
        try {
            const repository = new CandidateMongoRepository(this.mongoDb);
            const usecase = new GetCandidatesUseCase(repository);
            const candidade = await usecase.execute(request);
            return ok(candidade);
        } catch (error) {
            return serverError(error);
        }
    }
}
