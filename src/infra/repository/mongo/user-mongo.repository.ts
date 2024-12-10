import { Collection, Db } from "mongodb";
import { IUserRepository } from "../../../domain/repository";
import { UserType } from "../../../domain/entity";
import User from "../../../domain/entity/user.entity";

export class UserMongoRepository implements IUserRepository {
    private collection: Collection<UserType>;
    constructor(readonly mongoDb: Db) {
        this.collection = this.mongoDb.collection("users");
    }

    public async getAll(): Promise<{ total: number; users: User[] }> {
        const data = await this.collection.find({}).toArray();
        if (!data?.length) return { total: 0, users: [] };
        const users = data.map((user: UserType) =>
            User.restore(user, user._id)
        );
        return { total: users?.length, users };
    }

    public async createCustomer(user: UserType): Promise<{ _id: string }> {
        const response = await this.collection.insertOne(user);
        return { _id: response.insertedId.toString() };
    }

    public async createMany(users: UserType[]): Promise<{ _id: string }[]> {
        throw new Error("Method not implemented.");
    }
}
