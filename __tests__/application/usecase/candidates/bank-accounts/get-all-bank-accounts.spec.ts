import { Db } from "mongodb";
import { MongoDb } from "../../../../../src/infra/mongodb/mongo-connection";
import { CandidateBankAccountMongoRepository } from "../../../../../src/infra/repository/mongo/candidate-back-accounts-mongo.repository";
import { candidatesFullList } from "../../../../fake-data/candidates-list-full.fake";
import { CandidateMongoRepository } from "../../../../../src/infra/repository/mongo";
import { GetCandidateBackAccountsUsecase } from "../../../../../src/application/usecase/candidates/bank-accounts/get-all-bank-accounts.usecase";
import {
    candidatesBankAccountsData,
    candidatesBankAccountsData2
} from "../../../../fake-data/candidates-bank-accounts.fake";

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
    await collectionBankAccount.insertMany(candidatesBankAccountsData);
});

const makeSut = () => {
    const candidateRepository = new CandidateMongoRepository(mongoDb);
    const candidateBankAccountRepository =
        new CandidateBankAccountMongoRepository(mongoDb);
    const usecase = new GetCandidateBackAccountsUsecase(
        candidateRepository,
        candidateBankAccountRepository
    );
    return {
        usecase
    };
};

test("deve buscar corretamente a lista de contas bancarias por canditato", async () => {
    const { usecase } = makeSut();
    const response = await usecase.execute();
    expect(response).toHaveLength(8);
}, 99999999);

test("deve buscar corretamente a lista de contas bancarias sem duplicatas", async () => {
    await collectionBankAccount.insertMany(candidatesBankAccountsData2);
    const { usecase } = makeSut();
    const response = await usecase.execute();
}, 99999999);
