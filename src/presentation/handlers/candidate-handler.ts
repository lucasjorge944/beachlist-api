import { APIGatewayEvent, Context } from "aws-lambda";
import {
    GetAllCandidateBackAccountsController,
    GetCandidateByDocumentController,
    GetCandidatesController,
    ImportCandidadeController,
    ImportCandidateBackAccountsController,
    ImportCandidateRelationsRepresentativeController,
    SaveManyCandidadeController,
    SyncCandidatesController
} from "../controllers/candidate";
import { MongoDb } from "../../infra/mongodb/mongo-connection";
import { BodyParser } from "../../_shared/handlers/body-parser.decorator";
import {
    GetAllCandidateDonationController,
    ImportCandidateDonationController
} from "../controllers/party-donations";
import {
    GetAllThirdPartyDonationController,
    ImportThirdPartyDonationsController
} from "../controllers/third-party-donations";
const mongoDbConnection = new MongoDb();

class CustomerHandler {
    constructor() {}

    @BodyParser()
    public async candidateImport(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new ImportCandidadeController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateGetByDocument(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetCandidateByDocumentController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateGetAll(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetCandidatesController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateSaveMany(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new SaveManyCandidadeController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateSyncAllSpce(event: APIGatewayEvent, _ctx: Context) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new SyncCandidatesController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateImportBankAccounts(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new ImportCandidateBackAccountsController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateGetAllBankAccounts(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetAllCandidateBackAccountsController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateImportRelationRepresentative(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new ImportCandidateRelationsRepresentativeController(
            mongoDb
        );
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateDonationImport(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new ImportCandidateDonationController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateDonationGetAll(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetAllCandidateDonationController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateDonationThirdPartyImport(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new ImportThirdPartyDonationsController(mongoDb);
        return await controller.execute(event.body as any);
    }

    @BodyParser()
    public async candidateDonationThirdPartyGetAll(
        event: APIGatewayEvent,
        _ctx: Context
    ) {
        const mongoDb = await mongoDbConnection.getDb(process.env.MONGO, {
            ssl: true,
            sslValidate: false
        });
        const controller = new GetAllThirdPartyDonationController(mongoDb);
        return await controller.execute(event.body as any);
    }
}
const handler = new CustomerHandler();
for (const methodName of Object.getOwnPropertyNames(
    CustomerHandler.prototype
)) {
    if (methodName === "constructor") continue;
    module.exports[methodName] = handler[methodName].bind(handler);
}
