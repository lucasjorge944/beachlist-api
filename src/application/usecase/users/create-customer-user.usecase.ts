import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { UserType } from "../../../domain/entity";
import { IUserRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class CreateCustomerUserUseCase implements Usecase {
    constructor(readonly userRepository: IUserRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        input.user.role = ["customer"];
        const response = await this.userRepository.createCustomer(input.user);
        return response;
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isString([
            "user.name",
            "user.password",
            "user.email",
            "user.phone"
        ]);
        if (input.user.role) checker.toErro("Invalid role.");
    }
}

type Input = {
    user: UserType;
};

type Output = { _id: string };
