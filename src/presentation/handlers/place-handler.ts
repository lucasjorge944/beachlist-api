import { APIGatewayEvent, Context } from "aws-lambda";
import { MongoDb } from "../../infra/mongodb/mongo-connection";
import { BodyParser } from "../../_shared/handlers/body-parser.decorator";
import { CreatePlaceController } from "../controllers/place";
const mongoDbConnection = new MongoDb();

class PlaceHandler {
    constructor() {}

    @BodyParser()
    public async createPlace(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new CreatePlaceController(mongoDb);
        return await controller.execute(event.body as any);
    }
}
const handler = new PlaceHandler();
for (const methodName of Object.getOwnPropertyNames(PlaceHandler.prototype)) {
    if (methodName === "constructor") continue;
    module.exports[methodName] = handler[methodName].bind(handler);
}
