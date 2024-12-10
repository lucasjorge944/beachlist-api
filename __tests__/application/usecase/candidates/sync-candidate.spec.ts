import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { SyncCandidatesUsecase } from "../../../../src/application/usecase/candidates/sycn.candidates.usecase.";
import { candidatesSpce } from "../../../fake-data/candidates-spce.fake";
import { candidatesFullList } from "../../../fake-data/candidates-list-full.fake";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("candidates");
    await collection.deleteMany();
    await collection.insertMany(candidatesFullList);
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
    const repository = new CandidateMongoRepository(mongoDb);
    const usecase = new SyncCandidatesUsecase(repository);
    return {
        usecase
    };
};

test("deve valida se tem input", async () => {
    const { usecase } = makeSut();
    const input: any = undefined;
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Nenhum parâmetro informado!");
    }
});

test("deve sincronizar as informações", async () => {
    const { usecase } = makeSut();
    const input: any = {
        candidates: candidatesSpce
    };
    await usecase.execute(input);
}, 999999);
