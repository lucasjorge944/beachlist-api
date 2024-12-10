import { Db } from "mongodb";
import { IController } from "../../protocols/controller.interface";
import { ok, serverError } from "../../protocols/http.helper";
import { HttpResponse } from "../../protocols/http.interface";
import { CandidateMongoRepository } from "../../../infra/repository/mongo";
import { ImportCandidadeUseCase } from "../../../application/usecase/candidates/import-candidate.usecase";
import AxiosHttpAdapter from "../../../infra/adapters/axios-http.adapter";
import { ElectionCampaignMongoRepository } from "../../../infra/repository/mongo/election-campaign-mongo.repository";
import { BrasilAPICepHttpGateway } from "../../../infra/gateway/http/brasilapi-cep-http.gateway";

export class ImportCandidadeController implements IController {
    constructor(readonly mongoDb: Db) {}

    public async execute(request: any): Promise<HttpResponse> {
        try {
            const candidateRepository = new CandidateMongoRepository(
                this.mongoDb
            );
            const consultGatewy = new BrasilAPICepHttpGateway(
                new AxiosHttpAdapter()
            );
            const electionCampaignRepository =
                new ElectionCampaignMongoRepository(this.mongoDb);
            const usecase = new ImportCandidadeUseCase(
                candidateRepository,
                consultGatewy,
                electionCampaignRepository
            );
            const response = await usecase.execute(request);
            return ok(response);
        } catch (error) {
            return serverError(error);
        }
    }
}
