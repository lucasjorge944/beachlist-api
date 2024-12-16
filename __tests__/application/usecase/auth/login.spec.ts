import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { UserMongoRepository } from "../../../../src/infra/repository/mongo";
import { LoginUseCase } from "../../../../src/application/usecase";

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
    const usecase = new LoginUseCase(repository);
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

test("must return user and token", async () => {
    const { usecase } = makeSut();
    await collection.insertOne({
        name: "John Doe",
        password:
            "$2a$10$6gxnlq2k/9vbvhoijydXh.YZi6gipiQwswKEUd1XUMNFuLBqKUfzO",
        email: "john.doe@example.com",
        phone: "1234567890"
    });
    const input: any = {
        email: "john.doe@example.com",
        password: "123456"
    };
    const response = await usecase.execute(input);
    expect(response.user).toBeDefined();
    expect(response.token).toBeDefined();
});

test("must return error if user not found", async () => {
    const { usecase } = makeSut();
    const input: any = {
        email: "john.doe@example.com",
        password: "123456"
    };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("User not found");
    }
});

test("must return error if password is invalid", async () => {
    const { usecase } = makeSut();
    await collection.insertOne({
        name: "John Doe",
        password:
            "$2a$10$6gxnlq2k/9vbvhoijydXh.YZi6gipiQwswKEUd1XUMNFuLBqKUfzO",
        email: "john.doe@example.com",
        phone: "1234567890"
    });
    const input: any = {
        email: "john.doe@example.com",
        password: "1234567890"
    };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Invalid password");
    }
});
