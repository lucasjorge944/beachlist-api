import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { UserType } from "../../../domain/entity";
import { IUserRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class CreateUserUseCase implements Usecase {
    constructor(readonly userRepository: IUserRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const user = this.userRepository.create(input.user);
        return { _id: "asd" };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
    }
}

type Input = {
    user: UserType;
};

type Output = { _id: string };
