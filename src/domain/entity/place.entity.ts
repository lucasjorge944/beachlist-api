import Entity from "../../_shared/domain/entity/entity.abstract";

class Place extends Entity<PlaceType> {
    constructor(readonly props: PlaceType, _id?: string) {
        super(props, _id);
    }

    static restore(props: PlaceType, _id?: string): Place {
        const entity = new Place(props, _id);
        return entity;
    }
}

export type PlaceType = {
    _id?: string;
    name: string;
    address: AddressType;
    opened: {
        from: Date;
        to: Date;
    };
    description: string;
    images: string[];
    logo: string;
    links?: {
        googleMaps: string;
        website: string;
        instagram: string;
        facebook: string;
        twitter: string;
        youtube: string;
    };
    services: { type: string; label: string }[];
    createdAt?: Date;
    updatedAt?: Date;
    plan: string;
};

type AddressType = {
    street: string;
    number: number;
    city: string;
    state: string;
    zipCode: string;
};

export default Place;
