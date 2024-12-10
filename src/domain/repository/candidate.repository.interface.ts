import { Candidate } from "../entity/candidate";

export interface ICandiateRepository {
    getAll(): Promise<{ total: number; candidates: Candidate[] }>;
    getByDocument(document: string): Promise<Candidate>;
    getPagination(
        options: getOptions
    ): Promise<{ total: number; candidates: Candidate[] }>;
    getByDocuments(documents: string[] | number[]): Promise<Candidate[]>;
    save(candidates: Candidate[]): Promise<void>;
    saveFromDonation(candidates: Candidate[]): Promise<void>;
    updateMany(candidates: Candidate[]): Promise<void>;
}

export type getOptions = {
    limit: number;
    page: number;
    options: {
        sort: {
            field: string;
            direction: number;
        }[];
        filter?: {
            role?: string[];
            sincronizado?: boolean[];
        };
        searchText?: string | null;
    };
};
