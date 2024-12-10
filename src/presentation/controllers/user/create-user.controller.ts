import { Db } from "mongodb";
import { IController } from "../../protocols/controller.interface";
import { ok, serverError } from "../../protocols/http.helper";
import { HttpResponse } from "../../protocols/http.interface";
import { CreateUserUseCase } from "../../../application/usecase";
import { UserMongoRepository } from "../../../infra/repository/mongo";

export class CreateUserController implements IController {
    constructor(readonly mongoDb: Db) {}

    public async execute(request: any): Promise<HttpResponse> {
        try {
            const repository = new UserMongoRepository(this.mongoDb);
            const usecase = new CreateUserUseCase(repository);
            const candidade = await usecase.execute(request);
            return ok(candidade);
        } catch (error) {
            return serverError(error);
        }
    }
}
