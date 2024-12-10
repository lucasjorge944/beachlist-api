import { Collection, Db } from "mongodb";

export class OperationsDAOMongo {
    private collection: Collection<any>;
    constructor(readonly mongoDb: Db) {
        this.collection = this.mongoDb.collection("operations");
    }

    public async create(log: {
        type: string | "insert" | "update" | "select";
        tableName: string;
        error: string;
        status?: string;
        details?: any;
    }): Promise<void> {
        await this.collection.insertOne({ ...log, createdAt: new Date() });
    }
}
