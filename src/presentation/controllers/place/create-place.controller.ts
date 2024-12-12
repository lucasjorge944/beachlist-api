import { Db } from "mongodb";
import { IController } from "../../protocols/controller.interface";
import { ok, serverError } from "../../protocols/http.helper";
import { HttpResponse } from "../../protocols/http.interface";
import { PlaceMongoRepository } from "../../../infra/repository/mongo";
import { CreatePlaceUseCase } from "../../../application/usecase/place";

export class CreatePlaceController implements IController {
    constructor(readonly mongoDb: Db) {}

    public async execute(request: any): Promise<HttpResponse> {
        try {
            const repository = new PlaceMongoRepository(this.mongoDb);
            const usecase = new CreatePlaceUseCase(repository);
            const place = await usecase.execute(request);
            return ok(place);
        } catch (error) {
            return serverError(error);
        }
    }
}
