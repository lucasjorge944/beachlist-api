import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { UserType } from "../../../domain/entity";
import { IUserRepository } from "../../../domain/repository";
import Usecase from "../usecase.interface";

export class LoginUseCase implements Usecase {
    constructor(readonly userRepository: IUserRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const user = await this.userRepository.getByEmail(input.email);
        if (!user) throw new Error("User not found");
        const isPasswordValid = bcrypt.compareSync(
            input.password,
            user.props.password
        );
        if (!isPasswordValid) throw new Error("Invalid password");
        const token = jwt.sign({ userId: user.props._id }, "secret", {
            expiresIn: "1h"
        });
        return { user: user.publicProps, token };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isString(["email", "password"]);
    }
}

type Input = {
    email: string;
    password: string;
};

type Output = { user: UserType; token: string };
