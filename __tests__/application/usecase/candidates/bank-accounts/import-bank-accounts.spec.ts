import { Db } from "mongodb";
import { MongoDb } from "../../../../../src/infra/mongodb/mongo-connection";
import { ImportCandidateBackAccountsUsecase } from "../../../../../src/application/usecase/candidates/bank-accounts/import-bank-accounts.usecase";
import { CandidateBankAccountMongoRepository } from "../../../../../src/infra/repository/mongo/candidate-back-accounts-mongo.repository";
import { CandidateMongoRepository } from "../../../../../src/infra/repository/mongo";
import {
    candidatesBankAccountsImport,
    candidatesBankAccountsImport2
} from "../../../../fake-data/candidates-bank-accounts-import.fake";
import { candidatesFullList } from "../../../../fake-data/candidates-list-full.fake";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collectionCandidates, collectionBankAccount;
beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});

beforeEach(async () => {
    collectionCandidates = await mongoDb.collection<any>("candidates");
    await collectionCandidates.deleteMany({});
    await collectionCandidates.insertMany(candidatesFullList);
    collectionBankAccount = await mongoDb.collection<any>("accounts-banks");
    await collectionBankAccount.deleteMany({});
});

const makeSut = () => {
    const candidateRepository = new CandidateMongoRepository(mongoDb);
    const candidateBankAccountRepository =
        new CandidateBankAccountMongoRepository(mongoDb);
    const usecase = new ImportCandidateBackAccountsUsecase(
        candidateRepository,
        candidateBankAccountRepository
    );
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

test("deve importar corretamente a lista de contas bancarias", async () => {
    const { usecase } = makeSut();
    const input: any = {
        accountsBankPerCandidate: candidatesBankAccountsImport
    };
    await usecase.execute(input);
    const accounts = await collectionBankAccount.find({}).toArray();
    expect(accounts.length).toEqual(38);
});

test("deve importar sem duplicar caso importe duas vezes", async () => {
    const { usecase } = makeSut();
    const input: any = {
        accountsBankPerCandidate: candidatesBankAccountsImport
    };
    await usecase.execute(input);
    await usecase.execute(input);
    const accounts = await collectionBankAccount.find({}).toArray();
    expect(accounts.length).toEqual(38);
});

test("deve importar somente as contas bancarias validas", async () => {
    const { usecase } = makeSut();
    const input: any = {
        accountsBankPerCandidate: candidatesBankAccountsImport2
    };
    const response = await usecase.execute(input);
    expect(
        response.filter((r) =>
            r?.erros?.includes("Dados da conta estão incompletos")
        )
    ).toHaveLength(35);
    const accounts = await collectionBankAccount.find({}).toArray();
    expect(accounts.length).toEqual(606);
});
