import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { ImportCandidadeUseCase } from "../../../../src/application/usecase/candidates/import-candidate.usecase";
import {
    candidatesImport01,
    candidatesImport02
} from "../../../fake-data/document-import.fake";
import { ViaCepHttpGateway } from "../../../../src/infra/gateway/http/via-cep-http.gateway";
import AxiosHttpAdapter from "../../../../src/infra/adapters/axios-http.adapter";
import { ElectionCampaignMongoRepository } from "../../../../src/infra/repository/mongo/election-campaign-mongo.repository";
import { electionCampaignFake } from "../../../fake-data/election-campaign.fake";
import { BrasilAPICepHttpGateway } from "../../../../src/infra/gateway/http/brasilapi-cep-http.gateway";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection, collectionElectionCampaign;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("candidates");
    await collection.deleteMany({});
    collectionElectionCampaign = await mongoDb.collection<any>(
        "campanha-eleitoral"
    );
    await collectionElectionCampaign.deleteMany({});
    await collectionElectionCampaign.insertMany(electionCampaignFake);
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
    const repository = new CandidateMongoRepository(mongoDb);
    const correioshttpgateway = new BrasilAPICepHttpGateway(
        MockHttpAdapter(null)
    );
    const electionCampaignRepository = new ElectionCampaignMongoRepository(
        mongoDb
    );
    const usecase = new ImportCandidadeUseCase(
        repository,
        correioshttpgateway,
        electionCampaignRepository
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

test("deve criar os candidatos que tem todos as informações validas", async () => {
    const repository = new CandidateMongoRepository(mongoDb);
    const correioshttpgateway = new BrasilAPICepHttpGateway(
        new AxiosHttpAdapter()
    );
    const electionCampaignRepository = new ElectionCampaignMongoRepository(
        mongoDb
    );
    const usecase = new ImportCandidadeUseCase(
        repository,
        correioshttpgateway,
        electionCampaignRepository
    );
    const input: any = { candidates: candidatesImport01 };
    const response = await usecase.execute(input);
    const candidates = await collection.find({}).toArray();
    expect(candidates).toHaveLength(32);
}, 9999);

test("deve atualizar um candidado caso as informações dele sejam alteradas", async () => {
    const { usecase } = makeSut();
    await collection.insertOne({
        _id: "2yy7wisaojm44k59wmjo62",
        dadosBasicos: {
            cpf: "10351265678",
            nome: "Hélio Umberto De Morais",
            tituloEleitor: "174787020221",
            endereco: {
                cep: "38240000",
                cidade: "Itapagipe",
                estado: "MG",
                rua: "G",
                bairro: "Jerônimo Francisco da Costa 2",
                numero: "65",
                complemento: "Casa",
                codigoEleitoral: "46671"
            },
            contato: { celular: "34999771592", email: "pt.itapagipe@gmail.com" }
        },
        dadosEleitorais: {
            cnpj: "56065930000188",
            candidatura: { name: "VEREADOR", numero: 13 },
            partido: { name: "PARTIDO DOS TRABALHADORES", numero: 13 },
            unidadeEleitoral: "46671"
        }
    });
    const input: any = {
        candidates: [
            {
                createdAt: 45509.65536829861,
                city: "Betim",
                candidateDocument: 10351265678,
                name: "Migel Umberto de Morais ",
                voterRegistration: 174787020221,
                role: "Vereador (a)",
                candidateNumber: 65333,
                campaignDocument: 56065930000188,
                cellphone: 34999771592,
                email: "pt.itapagipe@gmail.com",
                zipcode: 32678128,
                street: "G",
                accounting: "Sim",
                juridical: "Sim",
                ethnicity: "PARDO(A)",
                gender: "HOMEM",
                complement: "Casa",
                district: "Jerônimo Francisco da Costa 2 ",
                number: 65
            }
        ]
    };
    await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "10351265678"
    });
    expect(candidate.dadosBasicos.nome).toEqual("MIGEL UMBERTO DE MORAIS");
    expect(candidate.dadosBasicos.endereco.cidade).toEqual("Betim");
    expect(candidate.dadosEleitorais.partido.name).toEqual(
        "PARTIDO COMUNISTA DO BRASIL"
    );
}, 9999);

test("deve criar os contatos corretamente mesmo enviando 2 vezes", async () => {
    const { usecase } = makeSut();
    const input: any = { candidates: candidatesImport01 };
    const response = await usecase.execute(input);
    const candidates = await collection.find({}).toArray();
    expect(candidates).toHaveLength(32);
    await usecase.execute(input);
    const candidatesAfter = await collection.find({}).toArray();
    expect(candidatesAfter).toHaveLength(32);
}, 9999999);

test("deve criar os candidatos que tem todos as informações validas", async () => {
    const { usecase } = makeSut();
    const input: any = { candidates: candidatesImport01 };
    const response = await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "30166241768"
    });
    expect(candidate.dadosBasicos.nome.toLowerCase()).toEqual(
        "Sebastião José Da Silva Miguel".toLowerCase()
    );
}, 9999);

test("deve registrar o endereço do vice como o do candidato", async () => {
    const { usecase } = makeSut();
    const input: any = { candidates: candidatesImport01 };
    const response = await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "59591781687"
    });
    expect(candidate.dadosBasicos.endereco.cep).toEqual("36390000");
    expect(candidate.dadosBasicos.endereco.codigoEleitoral).toEqual("46892");
}, 9999);

test("deve alterar corretamente o vice do prefeito ", async () => {
    const { usecase } = makeSut();
    const input: any = {
        candidates: [
            {
                createdAt: 45520.3657117708,
                city: "Cambuí",
                candidateDocument: 60190523620,
                name: "Robson Batista Franco ",
                voterRegistration: "093763670213",
                role: "Prefeito",
                candidateNumber: 13,
                campaignDocument: 56867820000130,
                cellphone: 35991384770,
                email: "ptcambuimg@gmail.com",
                zipcode: 37600000,
                street: "capitão soares",
                number: 438,
                district: "centro",
                accounting: "Sim",
                ethnicity: "BRANCO(A)",
                gender: "HOMEM",
                viceName: "Thamiris Dias de Oliveira",
                viceDocument: "09515222648"
            },
            {
                createdAt: 45520.3657117708,
                city: "Cambuí",
                candidateDocument: "09515222648",
                name: "Thamiris Dias de Oliveira",
                voterRegistration: 160704130281,
                role: "Vice Prefeito",
                candidateNumber: 13,
                campaignDocument: 56872180000156,
                cellphone: 35988746785,
                email: "thamiriscambui@gmail.com",
                zipcode: 37600000,
                street: "SILVERIO BENTO DA SILVA",
                number: 72,
                district: "CENTRO",
                accounting: "Sim"
            }
        ]
    };
    await usecase.execute(input);
    await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "60190523620"
    });
    expect(candidate.dadosEleitorais.viceDocument).toEqual("09515222648");
}, 9999999);

test("deve cadastrar corretamente o partido de acordo com o numero de campanha", async () => {
    const { usecase } = makeSut();
    const input: any = {
        candidates: [
            {
                createdAt: 45524.9237593403,
                city: "Caldas",
                candidateDocument: 28099964829,
                name: "REINER LEONARDO RODRIGUES SANTO",
                voterRegistration: 119622040213,
                role: "Vereador",
                candidateNumber: 43107,
                campaignDocument: 56373060000104,
                cellphone: "21 980858340",
                email: "ptdecaldasmg@riseup.net",
                zipcode: 37780000,
                street: "Praça das Hortências",
                number: 31,
                district: "Pocinhos do Rio Verde",
                accounting: "Sim",
                ethnicity: "BRANCO(A)",
                gender: "HOMEM"
            }
        ]
    };
    await usecase.execute(input);
    await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "28099964829"
    });
    expect(candidate.dadosEleitorais.partido.name).toEqual("PARTIDO VERDE");
}, 9999999);

test.skip("deve importa a lista completa", async () => {
    const { usecase } = makeSut();
    const input: any = {
        candidates: [...candidatesImport02, ...candidatesImport01]
    };
    await usecase.execute(input);
    const candidates = await collection.find({}).toArray();
    // console.log(JSON.stringify(candidates));
}, 9999999);
