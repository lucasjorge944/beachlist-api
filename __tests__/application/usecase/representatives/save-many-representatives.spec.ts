import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { RepresentativeMongoRepository } from "../../../../src/infra/repository/mongo/representatives-mongo.repository";
import { SaveManyRepresentativeUsecase } from "../../../../src/application/usecase/representative/save-many-representatives.usecase";
import { CPFUtils } from "../../../../src/_shared/utils/cpf-utils";
import { StringUtils } from "../../../../src/_shared/utils/string-ultils";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});

beforeEach(async () => {
    collection = await mongoDb.collection<any>("representatives");
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
    const repository = new RepresentativeMongoRepository(mongoDb);
    const usecase = new SaveManyRepresentativeUsecase(repository);
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

test.only("deve criar os representantes apartir de um array", async () => {
    const representantes = [
        [
            "Advogado ",
            "Luís Gustavo d’Avila Riani",
            "751.502.556-53",
            "89131470299",
            "MG-75004",
            "31 9444-5555",
            "rdr.advconsultoria@gmail.com",
            "30170-050",
            "Belo Horizonte",
            "Rua Matias Cardoso",
            "63",
            "Santo Agostinho",
            "1406/1408"
        ],
        [
            "Advogado ",
            "Alexandre Lúcio da Costa",
            "894.467.716-68",
            "92851720205",
            "MG-59821",
            "32 9444-5555",
            "rdr.advconsultoria@gmail.com",
            "30170-050",
            "Belo Horizonte",
            "Rua Matias Cardoso",
            "63",
            "Santo Agostinho",
            "1406/1408"
        ],
        [
            "Advogado ",
            "Larissa de Moura Guerra Almeida",
            "098.748.966-63",
            "174276960264",
            "MG-144249",
            "33 9444-5555",
            "rdr.advconsultoria@gmail.com",
            "30170-050",
            "Belo Horizonte",
            "Rua Matias Cardoso",
            "63",
            "Santo Agostinho",
            "1406/1408"
        ],
        [
            "Advogado ",
            "Matheus Regufe Braga Teixeira",
            "104.926.976-47",
            "186541100248",
            "MG-120083",
            "31 9453-3333",
            "regufeteixeira@gmail.com",
            "30441-194",
            "Belo Horizonte",
            "Av. Raja Gabáglia",
            "1492",
            "Gutierrez",
            "1203"
        ],
        [
            "Advogado ",
            "Carla Freira de Abreu",
            "829.989.576-68",
            "097520100213",
            "MG-75074",
            "32 9912-0333",
            "freiredeabreuadv@gmail.com",
            "36600-114",
            "São João del Rei",
            "Rua Santa Tereza",
            "7",
            "Centro",
            ""
        ],
        [
            "Advogado ",
            "Marcelo J. Ferreira",
            "043.143.486-74",
            "011280720421",
            "MG-116402",
            "33 8720-1513",
            "freiredeabreuadv@gmail.com",
            "36600-114",
            "São João del Rei",
            "Rua Santa Tereza",
            "7",
            "Centro",
            ""
        ],
        [
            "Advogado ",
            "Alessandra Maria da Silva",
            "089.959.896-02",
            "165315290264",
            "MG-139196",
            "32 8422-6574",
            "alessandra-marciano@hotmail.com",
            "36200-068",
            "Barbacena",
            "Avenida Bias Fortes",
            "315",
            "Centro",
            "2 Andar, Sala 4"
        ],
        [
            "Advogado ",
            "Wellington David dos Santos",
            "069.922.036-06",
            "157034730299",
            "MG-202027",
            "34 8487-4884",
            "welligton13ds@hotmail.com",
            "36135-000",
            "Santa Rita de Jacutinga",
            "Rua Monsenhor Marciano",
            "292",
            "Centro",
            ""
        ],
        [
            "Contador ",
            "Matheus Regufe Braga Teixeira",
            "104.926.976-47",
            "186541100248",
            "MG-120083",
            "31 9453-3333",
            "regufeteixeira@gmail.com",
            "30441-194",
            "Belo Horizonte",
            "Av. Raja Gabáglia",
            "1492",
            "Gutierrez",
            "1203"
        ],
        [
            "Contador ",
            "Lucas Regufe Braga Teixeira",
            "084.128.256-08",
            "157706950281",
            "MG-120082",
            "31 9197-6868",
            "regufeteixeira@gmail.com",
            "30441-194",
            "Belo Horizonte",
            "Av. Raja Gabáglia",
            "1492",
            "Gutierrez",
            "1203"
        ]
    ];

    const result: any = representantes.map((r) => {
        return {
            dadosBasicos: {
                cpf: CPFUtils.clear(r[2]),
                nome: r[1],
                tituloEleitor: r[3],
                endereco: {
                    cep: StringUtils.standardizeCEP(r[7]),
                    cidade: StringUtils.standardizeText(r[8]),
                    estado: "MG",
                    rua: StringUtils.standardizeText(r[9]),
                    bairro: StringUtils.standardizeText(r[11]),
                    numero: StringUtils.standardizeText(r[10]),
                    complemento: StringUtils.standardizeText(r[12])
                },
                contato: {
                    celular: StringUtils.standardizePhone(r[5]),
                    email: StringUtils.standardizeText(r[6])
                },
                tipo: StringUtils.standardizeText(r[0]),
                registroProfisional: StringUtils.standardizeText(r[4])
            }
        };
    });
    const { usecase } = makeSut();
    await usecase.execute({ representatives: result });
    const r = await collection.find({}).toArray();
});
test("deve criar o representatente", async () => {
    const { usecase } = makeSut();
    const input = {
        representatives: [
            {
                _id: "32187jkl4g9jyyktskpt312",
                dadosBasicos: {
                    cpf: "10492697647",
                    nome: "Matheus Regufe Braga Teixeira",
                    tituloEleitor: "186541100248",
                    endereco: {
                        cep: "30441194",
                        cidade: "Belo Horizonte",
                        estado: "MG",
                        rua: "Avenida Raja Gabaglia",
                        bairro: "Gutierrez",
                        numero: "1492",
                        complemento: "1203"
                    },
                    contato: {
                        celular: "31994533333",
                        email: "matheusrbt@hotmail.com"
                    },
                    tipo: "Contador",
                    registroProfisional: "CRC MG 120083/O"
                }
            }
        ]
    };
    await usecase.execute(input);
    const representative = await collection.findOne({
        "dadosBasicos.cpf": "10492697647"
    });

    expect(representative.dadosBasicos.nome).toEqual(
        "Matheus Regufe Braga Teixeira"
    );
    expect(representative.dadosBasicos.registroProfisional).toEqual(
        "CRC MG 120083/O"
    );
}, 9999);
