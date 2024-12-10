import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { UserMongoRepository } from "../../../../src/infra/repository/mongo";
import { CreateCustomerUserUseCase } from "../../../../src/application/usecase";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("users");
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
    const repository = new UserMongoRepository(mongoDb);
    const usecase = new CreateCustomerUserUseCase(repository);
    return {
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

test("must create a customer user", async () => {
    const { usecase } = makeSut();
    const input: any = {
        user: {
            name: "John Doe",
            password: "123456",
            email: "john.doe@example.com",
            phone: "1234567890"
        }
    };
    const response = await usecase.execute(input);
    expect(response._id).toBeDefined();
});

test("must return error if send role", async () => {
    const { usecase } = makeSut();
    const input: any = {
        user: {
            name: "John Doe",
            password: "123456",
            email: "john.doe@example.com",
            phone: "1234567890",
            role: ["admin"]
        }
    };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Invalid role.");
    }
});
