import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { ImportThirdPartyDonationsUsecase } from "../../../../src/application/usecase/third-party-donations/import-third-party-donations.usecase";
import { DonationMongoRepository } from "../../../../src/infra/repository/mongo/donation-mongo.repository";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { candidateDonationsThird } from "../../../fake-data/candidate-donations-third.fake";
import { candidatesFullList } from "../../../fake-data/candidates-list-full.fake";
const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection, donationsCollection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});

beforeEach(async () => {
    collection = await mongoDb.collection<any>("candidates");
    await collection.deleteMany({});
    await collection.insertMany(candidatesFullList);
    donationsCollection = await mongoDb.collection<any>("donations");
    await donationsCollection.deleteMany({});
});

const makeSut = () => {
    const repository = new CandidateMongoRepository(mongoDb);
    const donationsRepository = new DonationMongoRepository(mongoDb);
    const usecase = new ImportThirdPartyDonationsUsecase(
        repository,
        donationsRepository
    );
    return {
        usecase
    };
};

test("deve importar a lista de candidatos com suas respectivas doações", async () => {
    const { usecase } = makeSut();
    const input: any = { data: candidateDonationsThird };
    await usecase.execute(input);
    const total = await donationsCollection.find({}).toArray();
    expect(total.length).toEqual(1000);
}, 999999);
