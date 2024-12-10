import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { CandidateType } from "../../../domain/entity/candidate";
import { RoleRelation } from "../../../domain/entity/roles.relation";
import { ICandiateRepository } from "../../../domain/repository/candidate.repository.interface";
import Usecase from "../usecase.interface";

export class GetCandidatesUseCase implements Usecase {
    constructor(readonly candidateRepository: ICandiateRepository) {}

    public async execute(input: Input): Promise<Output> {
        this.validateInput(input);
        const { limit, page, options } = input;
        const { candidates, total } =
            await this.candidateRepository.getPagination({
                limit,
                page,
                options
            });
        if (!candidates.length) return { list: [], total: 0 };

        return { list: candidates.map((c) => c.toJSON()), total };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
        checker.isNumber(["limit", "page"]);
        if (input?.options.filter?.role)
            checker.isArrayWithValues(
                "options.filter.role",
                RoleRelation.getRoles()
            );
        if (input?.options.filter?.sincronizado)
            checker.isArrayWithValues("options.filter.sincronizado", [
                true,
                false
            ]);
    }
}

type Input = {
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

type Output = { list: CandidateType[]; total: number };
