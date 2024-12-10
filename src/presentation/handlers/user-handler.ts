import { APIGatewayEvent, Context } from "aws-lambda";
import { MongoDb } from "../../infra/mongodb/mongo-connection";
import { BodyParser } from "../../_shared/handlers/body-parser.decorator";
import { CreateUserController } from "../controllers/user";
const mongoDbConnection = new MongoDb();

class UserHandler {
    constructor() {}

    @BodyParser()
    public async createUser(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new CreateUserController(mongoDb);
        return await controller.execute(event.body as any);
    }
}
const handler = new UserHandler();
for (const methodName of Object.getOwnPropertyNames(UserHandler.prototype)) {
    if (methodName === "constructor") continue;
    module.exports[methodName] = handler[methodName].bind(handler);
}
