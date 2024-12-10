import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { RepresentativeMongoRepository } from "../../../../src/infra/repository/mongo/representatives-mongo.repository";
import { GetAllRepresentativesUsecase } from "../../../../src/application/usecase/representative/get-all-representatives.usecase";
import { representativesData } from "../../../fake-data/representative-fake";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});

beforeEach(async () => {
    collection = await mongoDb.collection<any>("representatives");
    await collection.deleteMany({});
    await collection.insertMany(representativesData);
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
    const repository = new RepresentativeMongoRepository(mongoDb);
    const usecase = new GetAllRepresentativesUsecase(repository);
    return {
        usecase
    };
};

test("deve listar os representantes", async () => {
    const { usecase } = makeSut();
    const { list } = await usecase.execute();
    expect(list).toHaveLength(10);
}, 9999);

test("deve listar somente os advogados", async () => {
    const { usecase } = makeSut();
    const { list } = await usecase.execute({ role: "Advogado" });
    expect(list).toHaveLength(8);
}, 9999);
