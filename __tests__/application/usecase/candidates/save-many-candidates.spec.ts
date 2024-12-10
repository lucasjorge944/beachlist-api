import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { CandidateMongoRepository } from "../../../../src/infra/repository/mongo";
import { SaveManyCandidadeUseCase } from "../../../../src/application/usecase/candidates/save-many-candidates.usecase";

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
    const usecase = new SaveManyCandidadeUseCase(repository);
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

test("deve criar o candidato e alterar seus campos dinamicos", async () => {
    const { usecase } = makeSut();
    const input = {
        candidates: [
            {
                dadosBasicos: {
                    cpf: "86113820050",
                    nome: "Marcos Morais",
                    tituloEleitor: "273503540159",
                    endereco: {
                        cep: "32604562",
                        cidade: "Betim",
                        estado: "MG",
                        rua: "Rua Carino Saraiva Moreira",
                        bairro: "Ingá",
                        numero: "65",
                        complemento: "Casa"
                    },
                    contato: {
                        celular: "34999771592",
                        email: "marcos@gmail.com"
                    }
                },
                dadosEleitorais: {
                    cnpj: "56065930000188",
                    candidatura: { name: "VEREADOR" },
                    partido: {
                        name: "PARTIDO DOS TRABALHADORES\t",
                        numero: 13
                    },
                    unidadeEleitoral: "21671"
                }
            }
        ]
    };
    await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "86113820050"
    });
    expect(candidate.dadosEleitorais.candidatura.numero).toEqual(13);
    expect(candidate.dadosEleitorais.unidadeEleitoral).toEqual("41335");
}, 9999);

test("deve criar os candidatos que tem todos as informações validas", async () => {
    const { usecase } = makeSut();
    await collection.insertOne({
        _id: "2yy7wisaojm44k59wmjo62",
        dadosBasicos: {
            cpf: "86113820050",
            nome: "Marcos Morais",
            tituloEleitor: "273503540159",
            endereco: {
                cep: "32604562",
                cidade: "Betim",
                estado: "MG",
                rua: "Rua Carino Saraiva Moreira",
                bairro: "Ingá",
                numero: "65",
                complemento: "Casa"
            },
            contato: {
                celular: "34999771592",
                email: "marcos@gmail.com"
            }
        },
        dadosEleitorais: {
            cnpj: "56065930000188",
            candidatura: { name: "VEREADOR" },
            partido: {
                name: "PARTIDO DOS TRABALHADORES\t",
                numero: 13
            },
            unidadeEleitoral: "21671"
        }
    });
    const input = {
        candidates: [
            {
                dadosBasicos: {
                    cpf: "86113820050",
                    nome: "Marcos Filho",
                    tituloEleitor: "273503540159",
                    endereco: {
                        cep: "30550170",
                        cidade: "Belo Horizonte",
                        estado: "MG",
                        rua: "Rua Lapinha",
                        bairro: "Salgado Filho",
                        numero: "65",
                        complemento: "Casa"
                    },
                    contato: {
                        celular: "34999771592",
                        email: "marcos@gmail.com"
                    }
                },
                dadosEleitorais: {
                    cnpj: "56065930000188",
                    candidatura: { name: "PREFEITO" },
                    partido: {
                        name: "PARTIDO DOS TRABALHADORES\t",
                        numero: 13
                    }
                }
            }
        ]
    };
    await usecase.execute(input);
    const candidate = await collection.findOne({
        "dadosBasicos.cpf": "86113820050"
    });

    expect(candidate.dadosEleitorais.candidatura.numero).toEqual(11);
    expect(candidate.dadosBasicos.nome).toEqual("MARCOS FILHO");
    expect(candidate.dadosEleitorais.unidadeEleitoral).toEqual("41238");
}, 9999);
