import { APIGatewayEvent, Context } from "aws-lambda";
import { MongoDb } from "../../infra/mongodb/mongo-connection";
import { BodyParser } from "../../_shared/handlers/body-parser.decorator";
import {
    CreatePlanController,
    GetPlanByNameController
} from "../controllers/plan";
const mongoDbConnection = new MongoDb();

class PlanHandler {
    constructor() {}

    @BodyParser()
    public async createPlan(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new CreatePlanController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async getPlanByName(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetPlanByNameController(mongoDb);
        return await controller.execute(event.body as any);
    }
}
const handler = new PlanHandler();
for (const methodName of Object.getOwnPropertyNames(PlanHandler.prototype)) {
    if (methodName === "constructor") continue;
    module.exports[methodName] = handler[methodName].bind(handler);
}
