import User, { UserType } from "../entity/user.entity";

export interface IUserRepository {
    getAll(): Promise<{ total: number; users: User[] }>;
    create(user: UserType): Promise<{ _id: string }>;
    createMany(users: UserType[]): Promise<{ _id: string }[]>;
}
