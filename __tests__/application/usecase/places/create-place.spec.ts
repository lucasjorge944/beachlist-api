import { Db } from "mongodb";
import { MongoDb } from "../../../../src/infra/mongodb/mongo-connection";
import { PlaceMongoRepository } from "../../../../src/infra/repository/mongo";
import { CreatePlaceUseCase } from "../../../../src/application/usecase";

const mongoDbConnection = new MongoDb();
let mongoDb: Db, collection;

beforeAll(async () => {
    mongoDb = await mongoDbConnection.getDb(global.__MONGO_URI__);
});
afterAll(async () => {
    await mongoDbConnection.closeDb();
});
beforeEach(async () => {
    collection = await mongoDb.collection<any>("places");
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
    const placeInputMock = {
        name: "Test Place",
        address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zipCode: "12345",
            number: 123
        },
        opened: {
            from: new Date().toISOString(),
            to: new Date()
        },
        description: "Test Place Description",
        images: ["image1.jpg", "image2.jpg"],
        logo: "logo.jpg",
        plan: "basic",
        services: [{ type: "service1", label: "Service 1" }],
        createdAt: new Date(),
        links: {
            googleMaps: "https://maps.google.com",
            website: "https://www.website.com",
            instagram: "https://www.instagram.com",
            facebook: "https://www.facebook.com",
            twitter: "https://www.twitter.com",
            youtube: "https://www.youtube.com"
        }
    };
    const repository = new PlaceMongoRepository(mongoDb);
    const usecase = new CreatePlaceUseCase(repository);
    return {
        placeInputMock,
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

test("must create a place", async () => {
    const { usecase, placeInputMock } = makeSut();
    const input: any = { place: placeInputMock };
    const response = await usecase.execute(input);
    expect(response._id).toBeDefined();
});

test("must not create a place with name empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.name;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: place.name não informado!"
        );
    }
});

test("must not create a place with address empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.address;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: place.address.street não informado!"
        );
    }
});

test("must not create a place with opened empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.opened;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Requisito não atendido: place.opened.from não é uma data válida!"
        );
    }
});

test("must not create a place with description empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.description;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: place.description não informado!"
        );
    }
});

test("must not create a place with logo empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.logo;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: place.logo não informado!"
        );
    }
});

test("must not create a place with plan empty", async () => {
    const { usecase, placeInputMock } = makeSut();
    delete placeInputMock.plan;
    const input: any = { place: placeInputMock };
    try {
        await usecase.execute(input);
        expect(true).toBe(false);
    } catch (error) {
        expect(error.message).toContain(
            "Ausência de: place.plan não informado!"
        );
    }
});
