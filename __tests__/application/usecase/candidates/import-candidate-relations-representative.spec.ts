import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { ImportCandidateRelationsRepresentativeUseCase } from "../../../../src/application/usecase/candidates/import-candidate-relations-representative.usecase";
import { RepresentativeMongoRepository } from "../../../../src/infra/repository/mongo/representatives-mongo.repository";
import { candidatesFullList } from "../../../fake-data/candidates-list-full.fake";
import { representativesData } from "../../../fake-data/representative-fake";
import { candidateRelation } from "../../../fake-data/candidate-relation-import.fake";
const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection, collectionRepresentatives;
beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("candidates");
    await collection.deleteMany({});
    await collection.insertMany(candidatesFullList);
    collectionRepresentatives = await mongoDb.collection<any>(
        "representatives"
    );
    await collectionRepresentatives.deleteMany({});
    await collectionRepresentatives.insertMany(representativesData);
});

const makeSut = () => {
    const representativeRepository = new RepresentativeMongoRepository(mongoDb);
    const candidateRepository = new CandidateMongoRepository(mongoDb);
    const usecase = new ImportCandidateRelationsRepresentativeUseCase(
        candidateRepository,
        representativeRepository
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

test("deve relacionar os candidatos que tem os dados validos", async () => {
    const { usecase } = makeSut();
    const input = {
        candidates: [
            {
                name: "CELSO DA COSTA FONTE",
                document: "11410857638",
                accountants: ["104.926.976-47"],
                lawyers: ["10492697647", "09874896663"]
            }
            // {
            //     name: "ANTONIO JOSE ALVES",
            //     document: "04859093836",
            //     accountants: ["104.926.976-47"],
            //     lawyers: ["10492697647", "09874896662"]
            // },
            // {
            //     name: "MIKE",
            //     document: "04859093822",
            //     accountants: ["104.926.976-47"],
            //     lawyers: ["10492697647"]
            // }
        ]
    };
    await usecase.execute(input);

    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "11410857638"
    });

    expect(candidate.dadosEleitorais.representates).toEqual(
        expect.arrayContaining([
            { cpf: "10492697647", cargo: "Contador", registro: "MG120083" },
            { cpf: "09874896663", cargo: "Advogado", registro: "MG144249" },
            { cpf: "10492697647", cargo: "Advogado", registro: "MG153937" }
        ])
    );
}, 9999999);

test("deve relacionar os candidatos ", async () => {
    const { usecase } = makeSut();
    const input = { candidates: candidateRelation };
    const repsonse = await usecase.execute(input);
});
