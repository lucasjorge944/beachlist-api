import Entity from "../../_shared/domain/entity/entity.abstract";

class User extends Entity<UserType> {
    constructor(readonly props: UserType, _id?: string) {
        super(props, _id);
    }

    static restore(props: UserType, _id?: string): User {
        const entity = new User(props, _id);
        return entity;
    }
}

export type UserType = {
    _id?: string;
    name: string;
    password: string;
    role: string[];
    email: string;
    document?: string;
    phone: string;
};

export default User;
