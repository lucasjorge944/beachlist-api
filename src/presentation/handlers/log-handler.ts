import { APIGatewayEvent, Context } from "aws-lambda";
import { MongoDb } from "../../infra/mongodb/mongo-connection";
import { BodyParser } from "../../_shared/handlers/body-parser.decorator";
import { CreateOperationsController } from "../controllers/create-operations.controller";

const mongoDbConnection = new MongoDb();

class LogHandler {
    constructor() {}

    @BodyParser()
    public async logCreate(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new CreateOperationsController(mongoDb);
        return await controller.execute(event.body as any);
    }
}
const handler = new LogHandler();
for (const methodName of Object.getOwnPropertyNames(LogHandler.prototype)) {
    if (methodName === "constructor") continue;
    module.exports[methodName] = handler[methodName].bind(handler);
}
