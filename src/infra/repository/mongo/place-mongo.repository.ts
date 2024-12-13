import { Collection, Db } from "mongodb";
import { PlaceType } from "../../../domain/entity";
import { IPlaceRepository } from "../../../domain/repository/place.repository.interface";
import Place from "../../../domain/entity/place.entity";

export class PlaceMongoRepository implements IPlaceRepository {
    private collection: Collection<PlaceType>;
    constructor(readonly mongoDb: Db) {
        this.collection = this.mongoDb.collection("places");
    }

    public async getAll(): Promise<{ total: number; places: Place[] }> {
        const data = await this.collection.find({}).toArray();
        if (!data?.length) return { total: 0, places: [] };
        const places = data.map((plan: PlaceType) =>
            Place.restore(plan, plan._id)
        );
        return { total: places?.length, places };
    }

    public async create(place: PlaceType): Promise<{ _id: string }> {
        const response = await this.collection.insertOne(place);
        return { _id: response.insertedId.toString() };
    }
}
