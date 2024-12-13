import Place, { PlaceType } from "../entity/place.entity";

export interface IPlaceRepository {
    getAll(): Promise<{ total: number; places: Place[] }>;
    create(place: PlaceType): Promise<{ _id: string }>;
}
