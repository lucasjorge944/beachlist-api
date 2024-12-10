import { CNPJUtils } from "../../../_shared/utils/cnpj-ultils";
import { CPFUtils } from "../../../_shared/utils/cpf-utils";
import { InputChecker } from "../../../_shared/utils/input-checker.utils";
import { StringUtils } from "../../../_shared/utils/string-ultils";
import {
    Candidate,
    CandidateInput,
    CandidateType
} from "../../../domain/entity/candidate";
import { RoleRelation } from "../../../domain/entity/roles.relation";
import { UFRelation } from "../../../domain/entity/uf-relation";
import {
    AddressResponse,
    IConsultAddressGateway
} from "../../../domain/gateway/consult-address.gateway.interface";
import { ICandiateRepository } from "../../../domain/repository/candidate.repository.interface";
import { IElectionCampaignRepository } from "../../../domain/repository/election-campaign.repository.interface";
import Usecase from "../usecase.interface";

export class ImportCandidadeUseCase implements Usecase {
    constructor(
        readonly candidateRepository: ICandiateRepository,
        readonly consultAddess: IConsultAddressGateway,
        readonly electionCampaignRepository: IElectionCampaignRepository
    ) {}

    public async execute(input: Input): Promise<Output[]> {
        this.validateInput(input);
        const candidatesData = await this.candidateRepository.getByDocuments(
            input.candidates.map((c) => String(c.candidateDocument))
        );
        const addressList = await this.consultAddess.getAddress(
            input.candidates.map((c) => StringUtils.standardizeCEP(c.zipcode))
        );
        const candidatesToSave = [];
        const candidatesToUpdate = [];
        const response: Output[] = [];
        for (let candidateInput of input.candidates) {
            if (!candidateInput.candidateDocument) continue;
            const hasCandidate = candidatesData.find(
                (c) => c.cpf == CPFUtils.clear(candidateInput.candidateDocument)
            );
            const sameDocument = input.candidates.filter(
                (c) => c.candidateDocument == candidateInput.candidateDocument
            );
            if (sameDocument.length > 1) {
                response.push({
                    name: StringUtils.standardizeName(candidateInput.name),
                    document: String(candidateInput.candidateDocument),
                    status: false,
                    erros: ["CPF duplicado"]
                });
            } else {
                if (!hasCandidate) {
                    const { candidate, result } = await this.createCandidate(
                        candidateInput,
                        addressList,
                        input.candidates
                    );
                    if (candidate) candidatesToSave.push(candidate);
                    response.push(result);
                } else {
                    candidateInput = this.normalizeAddress(
                        candidateInput,
                        addressList
                    );
                    hasCandidate.change(this.toCandidateType(candidateInput));
                    candidatesToUpdate.push(hasCandidate);
                }
            }
        }
        if (candidatesToUpdate.length)
            await this.candidateRepository.updateMany(candidatesToUpdate);
        if (candidatesToSave.length)
            await this.candidateRepository.save(candidatesToSave);

        return response;
    }

    private async createCandidate(
        candidate: CandidateInput,
        addressList: AddressResponse[],
        inputCandidates: CandidateInput[]
    ): Promise<{
        candidate: Candidate;
        result: Output;
    }> {
        let result: Output = {
            name: StringUtils.standardizeName(candidate.name),
            document: String(candidate.candidateDocument),
            status: true
        };
        let candidateEntity = null;
        const isValidCPF = CPFUtils.validate(candidate.candidateDocument);
        const isValidCNPJ = CNPJUtils.validate(candidate.campaignDocument);
        let isValidCEP = StringUtils.isValidCEP(candidate.zipcode);
        if (!isValidCEP)
            isValidCEP = this.copyToSuplente(candidate, inputCandidates);
        candidate = this.normalizeAddress(candidate, addressList);
        if (isValidCPF && isValidCNPJ && isValidCEP) {
            const hasCampaing =
                await this.electionCampaignRepository.getByDocument(
                    String(candidate.campaignDocument)
                );
            const candidateToCreate = this.toCandidateType(candidate);
            if (hasCampaing)
                candidateToCreate.dadosBasicos.nome = hasCampaing.props.nome;
            candidateEntity = Candidate.create(candidateToCreate);
            if (!candidateEntity.hasCodigoEleitoral()) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["Cidade não encontrada"]
                };
                candidateEntity = null;
            }
            if (!candidateEntity.validTituloDeEleitor()) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["Titulo de eleitor inválido"]
                };
                candidateEntity = null;
            }
        } else {
            if (!isValidCEP) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["CEP inválido"]
                };
            }
            if (!isValidCNPJ && !isValidCPF) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["CPF inválido", "CNPJ inválido"]
                };
            }
            if (!isValidCPF) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["CPF inválido"]
                };
            }
            if (!isValidCNPJ) {
                result = {
                    name: StringUtils.standardizeName(candidate.name),
                    document: String(candidate.candidateDocument),
                    status: false,
                    erros: ["CNPJ inválido"]
                };
            }
        }
        return { result, candidate: candidateEntity };
    }

    private copyToSuplente(candidate, inputCandidates): boolean {
        let isValidCEP = false;
        if (candidate?.role?.toLocaleLowerCase()?.includes("vice")) {
            const suplenete = inputCandidates.find(
                (c) =>
                    CPFUtils.clear(c.viceDocument) ===
                    CPFUtils.clear(candidate.candidateDocument)
            );
            if (suplenete) {
                const isValid = StringUtils.isValidCEP(suplenete.zipcode);
                if (isValid) {
                    isValidCEP = true;
                    candidate.zipcode = suplenete.zipcode;
                    candidate.street = suplenete.street;
                    candidate.number = suplenete.number;
                    candidate.district = suplenete.district;
                    candidate.complement = suplenete.complement;
                    candidate.city = suplenete.city;
                }
            }
        }
        return isValidCEP;
    }

    private normalizeAddress(
        candidate: CandidateInput,
        addressList
    ): CandidateInput {
        if (!addressList.length) return candidate;

        const normalizeAddress = addressList.find(
            (addresss) =>
                StringUtils.standardizeCEP(addresss?.cep) ===
                StringUtils.standardizeCEP(candidate.zipcode)
        );
        if (normalizeAddress) {
            candidate.city = normalizeAddress.localidade || candidate.city;
            candidate.district = normalizeAddress.bairro || candidate.district;
            candidate.street = normalizeAddress.logradouro || candidate.street;
        }
        return candidate;
    }

    private toCandidateType(candidate: CandidateInput): CandidateType {
        const city = StringUtils.standardizeText(candidate.city);
        return {
            contabil: candidate?.accounting || "Sim",
            juridico: candidate?.juridical || "Não",
            dadosBasicos: {
                cpf: StringUtils.standardizeText(candidate.candidateDocument),
                nome: StringUtils.standardizeName(candidate.name),
                tituloEleitor: StringUtils.standardizeTitulo(
                    candidate.voterRegistration
                ),
                endereco: {
                    cep: StringUtils.standardizeText(candidate.zipcode),
                    cidade: city,
                    estado: "MG",
                    rua: StringUtils.standardizeText(candidate.street) || "-",
                    bairro:
                        StringUtils.standardizeText(candidate.district) || "-",
                    numero: StringUtils.standardizeText(candidate.number),
                    complemento:
                        StringUtils.standardizeText(candidate.complement) ||
                        null,
                    codigoEleitoral: UFRelation.getCodigoEleitoral(city)
                },
                contato: {
                    celular: StringUtils.standardizePhone(candidate.cellphone),
                    email: StringUtils.standardizeEmail(candidate.email)
                }
            },
            dadosEleitorais: {
                cnpj: CNPJUtils.clear(candidate.campaignDocument),
                candidatura: {
                    name: RoleRelation.converte(candidate.role)
                },
                numeroDoCandidato: StringUtils.standardizeText(
                    candidate.candidateNumber
                ),
                partido: { name: "PARTIDO DOS TRABALHADORES", numero: 13 },
                viceDocument: candidate.viceDocument
            },
            dadosPrestacaoDeContas: {
                origin: "Criado apartir da importação"
            }
        };
    }

    private errorManager(candidate: CandidateInput): Output {
        return {
            name: StringUtils.standardizeName(candidate.name),
            document: String(candidate.candidateDocument),
            status: false,
            erros: ["CIDADE NÃO ENCONTRADA NA UN ELEITORAL"]
        };
    }

    private validateInput(input: Input) {
        const checker = new InputChecker(input);
    }
}

type Input = {
    candidates: CandidateInput[];
};

type Output = {
    name: string;
    document: string;
    status: boolean;
    erros?: string[];
};
