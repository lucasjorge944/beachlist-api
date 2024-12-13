import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { PlanMongoRepository } from "../../../../src/infra/repository/mongo";
import { GetPlanByNameUseCase } from "../../../../src/application/usecase";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("plans");
    await collection.deleteMany();
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
    const planInputMock = {
        name: "Plan 1",
        description: "Description 1",
        price: 100
    };
    const repository = new PlanMongoRepository(mongoDb);
    const usecase = new GetPlanByNameUseCase(repository);
    return {
        planInputMock,
        usecase
    };
};

test("must validate input", async () => {
    const { usecase } = makeSut();
    const input: any = undefined;
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Input is required");
    }
});

test("must return a plan", async () => {
    const { usecase, planInputMock } = makeSut();
    await collection.insertOne(planInputMock);
    const input: any = { name: "Plan 1" };
    const response = await usecase.execute(input);
    expect(response.plan.name).toEqual(planInputMock.name);
});

test("must return an error if plan not found", async () => {
    const { usecase } = makeSut();
    const input: any = { name: "Plan 2" };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Plan not found");
    }
});
