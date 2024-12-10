import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { candidatesData } from "../../../fake-data/candidates.fake";
import { GetCandidatesUseCase } from "../../../../src/application/usecase/candidates/get-candidates.usecase";
import { filter } from "lodash";
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
    await collection.deleteMany({});
    await collection.insertMany(candidatesData);
});

const makeSut = () => {
    const repository = new CandidateMongoRepository(mongoDb);
    const usecase = new GetCandidatesUseCase(repository);
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

test("deve buscar corretamente a lista de candidatos", async () => {
    const { usecase } = makeSut();
    const input = {
        limit: 5,
        page: 0,
        options: {
            sort: [
                {
                    field: "name",
                    direction: -1
                }
            ]
        }
    };
    const { list } = await usecase.execute(input);
    expect(list).toHaveLength(5);
});

test("deve filtrar os candidatos que são prefeitos", async () => {
    const { usecase } = makeSut();
    const input = {
        limit: 100,
        page: 0,
        options: {
            sort: [
                {
                    field: "name",
                    direction: -1
                }
            ],
            filter: {
                role: ["PREFEITO"]
            }
        }
    };
    const { list } = await usecase.execute(input);
    expect(list).toHaveLength(2);
});
