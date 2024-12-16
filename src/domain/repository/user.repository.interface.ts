import User, { UserType } from "../entity/user.entity";

export interface IUserRepository {
    getAll(): Promise<{ total: number; users: User[] }>;
    createCustomer(user: UserType): Promise<{ _id: string }>;
    createMany(users: UserType[]): Promise<{ _id: string }[]>;
    getByEmail(email: string): Promise<User>;
}
