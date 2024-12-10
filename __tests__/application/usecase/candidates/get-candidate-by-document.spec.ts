import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { GetCandidateByDocumentUseCase } from "../../../../src/application/usecase/candidates/get-candidate-by-document.usecase";
import { candidatesData } from "../../../fake-data/candidates.fake";
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
    const usecase = new GetCandidateByDocumentUseCase(repository);
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

test("deve valida se o CPF e valido", async () => {
    const { usecase } = makeSut();
    const input = {
        document: "0185694969"
    };
    try {
        await usecase.execute(input);
    } catch (error) {
        expect(error.message).toContain("CPF inválido");
    }
});

test("deve consultar os dados do cliente de forma externa caso ele não exista na base", async () => {
    const { usecase } = makeSut();
    const input = { document: "10351265678" };
    const customer = await usecase.execute(input);
    expect(customer.dadosBasicos.nome).toEqual("HéLio Umberto De Morais");
    expect(typeof customer.dadosEleitorais).toEqual("object");
});
