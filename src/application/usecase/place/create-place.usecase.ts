import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { PlaceType, UserType } from "../../../domain/entity";
import { IPlaceRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class CreatePlaceUseCase implements Usecase {
    constructor(readonly placeRepository: IPlaceRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const response = await this.placeRepository.create(input.place);
        return response;
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isString([
            "place.name",
            "place.address.street",
            "place.address.city",
            "place.address.state",
            "place.address.zipCode",
            "place.description",
            "place.logo",
            "place.plan"
        ]);
        checker.isNumber(["place.address.number"]);
        checker.isArrayWithValues("place.images", ["image1.jpg", "image2.jpg"]);
        checker.isDate(["place.opened.from", "place.opened.to"]);
    }
}

type Input = {
    place: PlaceType;
};

type Output = { _id: string };
