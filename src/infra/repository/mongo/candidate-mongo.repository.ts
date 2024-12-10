import { Collection, Db } from "mongodb";
import { Candidate, CandidateType } from "../../../domain/entity/candidate";
import {
    getOptions,
    ICandiateRepository
} from "../../../domain/repository/candidate.repository.interface";
import { CPFUtils } from "../../../_shared/utils/cpf-utils";

export class CandidateMongoRepository implements ICandiateRepository {
    private collection: Collection<CandidateType>;
    constructor(readonly mongoDb: Db) {
        this.collection = this.mongoDb.collection("candidates");
    }

    public async getAll(): Promise<{ total: number; candidates: Candidate[] }> {
        const data = await this.collection.find({}).toArray();
        if (!data?.length) return { total: 0, candidates: [] };
        const candidates = data.map((candidate) =>
            Candidate.restore(candidate, candidate._id)
        );
        return { total: candidates?.length, candidates };
    }

    public async updateMany(candidates: Candidate[]): Promise<void> {
        if (candidates?.length) {
            await this.collection.deleteMany({
                _id: {
                    $in: candidates.map((c) => c.props._id)
                }
            });
            const uniqCandidates: Candidate[] = [];
            candidates.forEach((c) => {
                const hasCadidate = uniqCandidates.find(
                    (newCandidate) => newCandidate?._id == c._id
                );
                if (!hasCadidate) uniqCandidates.push(c);
            });
            await this.save(uniqCandidates);
        }
    }

    public async getByDocuments(
        documents: string[] | number[]
    ): Promise<Candidate[]> {
        const documentsClean = documents.map((document) =>
            CPFUtils.clear(document)
        );
        const candidatesData = await this.collection
            .find({ "dadosBasicos.cpf": { $in: documentsClean } })
            .toArray();
        if (!candidatesData?.length) return [];
        return candidatesData.map((candidate) =>
            Candidate.restore(candidate, candidate._id)
        );
    }

    public async getByDocument(document: string): Promise<Candidate> {
        const candidateData = await this.collection.findOne({
            "dadosBasicos.cpf": document
        });
        if (!candidateData) return null;
        return Candidate.restore(candidateData, candidateData._id);
    }

    public async save(candidates: Candidate[]): Promise<void> {
        const promiseAll: any[] = [];
        const candidateData: CandidateType[] = [];
        const uniq = {};
        for (let candidate of candidates) {
            if (!uniq[candidate.cpf]) {
                uniq[candidate.cpf] = true;
                candidateData.push(candidate.toJSON());
            }
        }
        while (candidateData.length) {
            const dataPart = candidateData.splice(0, 50);
            promiseAll.push(
                new Promise((resolve, _) =>
                    resolve(this.collection.insertMany(dataPart))
                )
            );
        }
        try {
            await Promise.all(promiseAll);
        } catch (error) {
            console.error(error);
        }
    }

    public async saveFromDonation(candidates: Candidate[]): Promise<void> {
        const promiseAll: any[] = [];
        const candidateData: CandidateType[] = [];
        const uniq = {};
        for (let candidate of candidates) {
            if (!uniq[candidate.CNPJ]) {
                uniq[candidate.CNPJ] = true;
                candidateData.push(candidate.toJSON());
            }
        }
        while (candidateData.length) {
            const dataPart = candidateData.splice(0, 50);
            promiseAll.push(
                new Promise((resolve, _) =>
                    resolve(this.collection.insertMany(dataPart))
                )
            );
        }
        try {
            await Promise.all(promiseAll);
        } catch (error) {
            console.error(error);
        }
    }

    public async getPagination(
        param: getOptions
    ): Promise<{ total: number; candidates: Candidate[] }> {
        let select: any = {};
        const sort = {};
        select = this.setFilter(select, param);
        if (![null, undefined, ""].includes(param.options.searchText)) {
            select["$or"] = this.genereteSearchOptions(
                param.options.searchText
            );
        }
        if (param.options?.sort?.length) {
            const fields = {
                name: "dadosBasicos.nome",
                createdAt: "createdAt"
            };
            param.options.sort.forEach((itemSort) => {
                const field = fields[itemSort.field];
                if (field) sort[field] = itemSort.direction;
            });
        }
        const candidatesData = await this.collection
            .find(select)
            .limit(param.limit)
            .sort(sort)
            .skip(param.page * param.limit)
            .toArray();

        if (!candidatesData.length)
            return {
                candidates: [],
                total: 0
            };

        return {
            candidates: candidatesData.map((c) => Candidate.restore(c, c._id)),
            total: await this.collection.countDocuments(select)
        };
    }

    private setFilter(select: any, param: getOptions): any {
        if (param.options?.filter) {
            const fields = {
                role: { key: "dadosEleitorais.candidatura.name", in: true },
                score: { key: "sincronizacao.status", in: true }
            };
            Object.keys(param.options?.filter).forEach((key) => {
                const field = fields[key];
                if (field && param.options?.filter[key].length && field.in)
                    select[field.key] = { $in: param.options?.filter[key] };
                else if (field && param.options?.filter[key] && !field.in)
                    select[field.key] = { $lte: param.options?.filter[key] };
            });
        }
        return select;
    }
    private genereteSearchOptions(text: string) {
        const regExp = {
            $regex: new RegExp(".*" + text + ".*", "i")
        };
        const query: any[] = [
            { "dadosBasicos.nome": regExp },
            { _id: regExp },
            { "dadosBasicos.contato.email": regExp }
        ];
        if (text.length >= 11) {
            query.push({
                "dadosBasicos.cpf": regExp
            });
            if (/[./]/g.test(text) && text.indexOf("@") < 0) {
                regExp.$regex = new RegExp(
                    ".*" + parseInt(text.replace(/[./]/g, "")) + ".*",
                    "i"
                );
            }
        }
        return query;
    }
}
