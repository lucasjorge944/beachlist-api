import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { PlanMongoRepository } from "../../../../src/infra/repository/mongo";
import { CreatePlanUseCase } from "../../../../src/application/usecase";

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
    const usecase = new CreatePlanUseCase(repository);
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

test("must create a plan", async () => {
    const { usecase, planInputMock } = makeSut();
    const input: any = { plan: planInputMock };
    const response = await usecase.execute(input);
    expect(response._id).toBeDefined();
});

test("must not create a plan with name empty", async () => {
    const { usecase, planInputMock } = makeSut();
    delete planInputMock.name;
    const input: any = { plan: planInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: plan.name não informado!"
        );
    }
});

test("must not create a plan with price empty", async () => {
    const { usecase, planInputMock } = makeSut();
    delete planInputMock.price;
    const input: any = { plan: planInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: plan.price não informado!"
        );
    }
});

test("must not create a plan with price different from number", async () => {
    const { usecase } = makeSut();
    const input: any = {
        plan: {
            name: "Plan 1",
            description: "Description 1",
            price: "100"
        }
    };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Requisito não atendido: plan.price inválido!"
        );
    }
});

test("must not create a plan with description empty", async () => {
    const { usecase, planInputMock } = makeSut();
    delete planInputMock.description;
    const input: any = { plan: planInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: plan.description não informado!"
        );
    }
});

test("must not create a plan if plan already exists", async () => {
    const { usecase, planInputMock } = makeSut();
    const input: any = { plan: planInputMock };
    await usecase.execute(input);
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain("Plan already exists");
    }
});
