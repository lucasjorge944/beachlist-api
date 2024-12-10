import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateDonationMongoRepository } from "../../../../src/infra/repository/mongo/candidates-donations-mongo.repository";
import { ImportPartyDonationsUsecase } from "../../../../src/application/usecase/party-donations/import-party-donations.usecase";
import {
    candidateDonationsFake,
    candidateDonationsFake2
} from "../../../fake-data/candidate-donations-import.fake";
const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});

beforeEach(async () => {
    collection = await mongoDb.collection<any>("candidates-donation");
    await collection.deleteMany({});
});

const MockHttpAdapter = (getMock?, postMock?) => {
    return {
        get: jest.fn().mockResolvedValue(getMock),
        post: jest.fn().mockResolvedValue(postMock),
        put: jest.fn().mockResolvedValue(postMock),
        patch: jest.fn().mockResolvedValue(postMock)
    };
};
const makeSut = () => {
    const repository = new CandidateDonationMongoRepository(mongoDb);
    const usecase = new ImportPartyDonationsUsecase(repository);
    return {
        usecase
    };
};

test("deve importar a lista de candidatos com suas respectivas doações", async () => {
    const { usecase } = makeSut();
    const input: any = { data: candidateDonationsFake };
    const response = await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cnpj": "56516531000196"
    });
    expect(candidate.doacoes).toHaveLength(2);
});

test.only("deve importar a lista de candidatos com suas respectivas doações", async () => {
    const { usecase } = makeSut();
    const input: any = { data: candidateDonationsFake2 };
    const response = await usecase.execute(input);

    // console.log(JSON.stringify(response));
});
