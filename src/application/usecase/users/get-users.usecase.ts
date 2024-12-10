import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { IUserRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class GetUserssUseCase implements Usecase {
    constructor(readonly userRepository: IUserRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const list = this.userRepository.getAll();
        return { list: [], total: 0 };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
    }
}

type Input = {};

type Output = { list: any[]; total: number };
