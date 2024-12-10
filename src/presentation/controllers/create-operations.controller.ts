import { OperationsDAOMongo } from "../../infra/dao/operation.mongodb-dao";
import { Db } from "mongodb";
export class CreateOperationsController {
    constructor(readonly mongoDb: Db) {}

    public async execute(input: Input): Promise<any> {
        const dao = new OperationsDAOMongo(this.mongoDb);
        await dao.create(input);
    }
}

type Input = {
    type: string | "insert" | "update" | "select";
    tableName: string;
    error: string;
    status?: string;
    details?: any;
};
