import Entity from "../../_shared/domain/entity/entity.abstract";
import { CNPJUtils } from "../../_shared/utils/cnpj-ultils";
import { CPFUtils } from "../../_shared/utils/cpf-utils";
import { StringUtils } from "../../_shared/utils/string-ultils";
import { Parties } from "./parties";
import { Representative } from "./representative";
import { RoleRelation } from "./roles.relation";
import { UFRelation } from "./uf-relation";

export class Candidate extends Entity<CandidateType> {
    private constructor(readonly props: CandidateType, _id?: string) {
        super(props, _id);
    }

    public setRepresentatives(representatives: Representative[]) {
        this.props.dadosEleitorais.representates = representatives.map((r) => {
            return {
                cpf: r.cpf,
                cargo: r.cargo,
                registro: r.registro
            };
        });
    }

    public hasCodigoEleitoral(): boolean {
        return this.props.dadosBasicos?.endereco?.codigoEleitoral
            ? true
            : false;
    }

    public validTituloDeEleitor(): boolean {
        return String(this.props.dadosBasicos?.tituloEleitor).length > 12
            ? false
            : true;
    }

    public sync(candidateSPCE: CandidateSPCE) {
        this.props.dadosBasicos.nome = candidateSPCE.NM_PESSOA;
        this.props.dadosBasicos.tituloEleitor = candidateSPCE.NR_TITULO_ELEITOR;
        this.props.dadosEleitorais.numeroDoCandidato = String(
            candidateSPCE.NR_CANDIDATO
        );
        this.setPartido();
        this.props.dadosBasicos.endereco = {
            cep: candidateSPCE?.NR_CEP,
            cidade: UFRelation.getCity(candidateSPCE.SG_UE),
            estado: "MG",
            rua: candidateSPCE.DS_LOGRADOURO,
            bairro: candidateSPCE.DS_BAIRRO,
            numero: candidateSPCE.NR_LOGRADOURO,
            complemento: candidateSPCE.DS_COMPLEMENTO,
            codigoEleitoral: candidateSPCE.SG_UE
        };
    }

    public get cpf(): string {
        return this.props.dadosBasicos.cpf;
    }

    public setRelationVice(viceDocument?: string): void {
        const isValid = CPFUtils.validate(viceDocument);
        if (viceDocument && isValid) {
            const hasVice = ["GOVERNADOR", "PREFEITO", "PRESIDENTE"];
            if (
                hasVice.includes(this.props.dadosEleitorais?.candidatura?.name)
            ) {
                this.props.dadosEleitorais.viceDocument =
                    CPFUtils.clear(viceDocument);
            }
        }
    }

    public static create(candidate: CandidateType): Candidate {
        candidate.dadosEleitorais.unidadeEleitoral =
            UFRelation.getCodigoEleitoral(
                candidate.dadosBasicos.endereco.cidade
            );

        candidate.dadosEleitorais.candidatura.numero =
            RoleRelation.getCandidaturaCode(
                candidate.dadosEleitorais.candidatura.name
            );
        candidate.dadosBasicos.cpf = CPFUtils.clear(candidate.dadosBasicos.cpf);

        if (candidate.dadosBasicos?.endereco?.numero)
            candidate.dadosBasicos.endereco.numero =
                StringUtils.standardizeNumero(
                    candidate.dadosBasicos.endereco.numero
                );
        const candidateEntity = new Candidate({
            ...candidate,
            createdAt: new Date()
        });
        candidateEntity.setRelationVice(candidate.dadosEleitorais.viceDocument);
        candidateEntity.setPartido();
        candidateEntity.setCargo();
        return candidateEntity;
    }

    public get codigoEleitoral(): string {
        return this.props.dadosBasicos.endereco.codigoEleitoral;
    }

    public static createFromThirdParty(input: {
        cnpj: string;
        nome: string;
        cidade: string;
        numeroDoCandidato: string;
        cargo: string;
    }): Candidate {
        const city = StringUtils.standardizeText(input.cidade);
        const data = {
            dadosBasicos: {
                nome: StringUtils.standardizeName(input.nome),
                endereco: {
                    cidade: city,
                    codigoEleitoral: UFRelation.getCodigoEleitoral(city)
                }
            },
            dadosEleitorais: {
                cnpj: CNPJUtils.clear(input.cnpj),
                numeroDoCandidato: StringUtils.standardizeText(
                    input.numeroDoCandidato
                ),
                candidatura: {
                    name: input.cargo,
                    numero: RoleRelation.getCandidaturaCode(input.cargo)
                }
            },
            dadosPrestacaoDeContas: {
                origin: "DOAÇÃO A TERCEIROS"
            }
        };
        const entity = new Candidate(data);

        entity.setPartido();
        return entity;
    }

    public get CNPJ(): string {
        return this.props.dadosEleitorais.cnpj;
    }

    public setCargo(): void {
        if (
            this.numeroCandidato?.length == 2 &&
            !this.cargo?.name?.includes("PREFEITO")
        ) {
            if (this.hasVice()) {
                this.props.dadosEleitorais.candidatura = {
                    name: "PREFEITO",
                    numero: 11
                };
            } else {
                this.props.dadosEleitorais.candidatura = {
                    name: "VICE_PREFEITO",
                    numero: 12
                };
            }
        } else if (
            this.numeroCandidato?.length === 5 &&
            !this.cargo?.name?.includes("VEREADOR")
        ) {
            this.props.dadosEleitorais.candidatura = {
                name: "VEREADOR",
                numero: 13
            };
        }
    }

    public hasVice(): boolean {
        if (this.props.dadosEleitorais.viceDocument) return true;
    }
    public get cargo(): { name: string; numero?: number } {
        return this.props.dadosEleitorais.candidatura;
    }

    public get numeroCandidato(): string {
        return this.props.dadosEleitorais.numeroDoCandidato;
    }

    public setPartido(): void {
        const numeroToString = String(
            this.props.dadosEleitorais.numeroDoCandidato
        );
        if (numeroToString.length > 1) {
            const partidoNumber = Number(numeroToString.substring(0, 2));
            this.props.dadosEleitorais.partido =
                Parties.getParties(partidoNumber);
        }
    }

    public static restore(props: CandidateType, _id: string): Candidate {
        const entity = new Candidate(props, _id);
        return entity;
    }

    public change(candidate: CandidateType, _id?: string): void {
        const city = StringUtils.standardizeText(
            candidate.dadosBasicos.endereco.cidade
        );
        candidate.dadosEleitorais.unidadeEleitoral =
            UFRelation.getCodigoEleitoral(
                candidate.dadosBasicos.endereco.cidade
            );

        candidate.dadosEleitorais.candidatura.numero =
            RoleRelation.getCandidaturaCode(
                candidate.dadosEleitorais.candidatura.name
            );
        this.props.dadosEleitorais = {
            cnpj: CNPJUtils.clear(candidate.dadosEleitorais.cnpj),
            candidatura: candidate.dadosEleitorais.candidatura,
            partido: { name: "PARTIDO DOS TRABALHADORES", numero: 13 },
            unidadeEleitoral: UFRelation.getCodigoEleitoral(city),
            numeroDoCandidato: candidate.dadosEleitorais.numeroDoCandidato
        };
        this.props.dadosBasicos.endereco = {
            cep: String(candidate.dadosBasicos.endereco.cep),
            cidade: city,
            estado: "MG",
            rua:
                StringUtils.standardizeText(
                    candidate.dadosBasicos.endereco.rua
                ) || "-",
            bairro:
                StringUtils.standardizeText(
                    candidate.dadosBasicos.endereco.bairro
                ) || "-",
            numero: StringUtils.standardizeNumero(
                candidate.dadosBasicos.endereco.numero
            ),
            complemento:
                StringUtils.standardizeText(
                    candidate.dadosBasicos.endereco.complemento
                ) || null,
            codigoEleitoral: UFRelation.getCodigoEleitoral(city)
        };
        this.props.dadosBasicos.nome = StringUtils.standardizeName(
            candidate.dadosBasicos.nome
        );
        this.props.dadosBasicos.tituloEleitor = StringUtils.standardizeText(
            candidate.dadosBasicos.tituloEleitor
        );
        this.props.dadosBasicos.contato = candidate.dadosBasicos.contato;
        this.setRelationVice(candidate.dadosEleitorais.viceDocument);
        this.setPartido();
        this.setCargo();
    }
}

export type CandidateType = {
    _id?: string;
    contabil?: string | "Sim" | "Não";
    juridico?: string | "Sim" | "Não";
    dadosBasicos: {
        cpf?: string;
        nome: string;
        tituloEleitor?: string;
        endereco?: AddressType;
        contato?: {
            celular?: string;
            telefone?: string;
            email: string;
        };
    };
    dadosEleitorais?: {
        cnpj: string;
        numeroDoCandidato?: string;
        candidatura?: { name: string; numero?: number };
        partido?: { name: string; numero: number };
        unidadeEleitoral?: string;
        viceDocument?: string;

        representates?: {
            cpf: string;
            cargo: string;
            registro: string;
        }[];
    };
    dadosPrestacaoDeContas?: {
        origin?: string;
    };
    sincronizacao?: {
        status?: boolean;
        time?: boolean;
        log?: string;
    };
    createdAt?: Date;
};

export type AddressType = {
    cep?: string;
    cidade: string;
    estado?: string;
    rua?: string;
    bairro?: string;
    numero?: string;
    complemento?: string;
    codigoEleitoral?: string;
};

export type CandidateInput = {
    createdAt: number;
    city: string;
    candidateDocument: string | number;
    name: string;
    voterRegistration: string | number;
    role: string;
    candidateNumber: number;
    campaignDocument: string | number;
    cellphone: string | number;
    email: string;
    zipcode: number;
    street: string;
    accounting: string | "Sim" | "Não";
    juridical: string | "Sim" | "Não";
    ethnicity: string;
    gender: string;
    complement?: string;
    district: string;
    number: number;

    viceName?: string;
    viceDocument?: string;
    viceVoterRegistration?: string;
    viceDocumentCampaign?: number | string;
};

export type CandidateSPCE = {
    SQ_PESSOA?: string | number;
    SQ_PESSOA_PRESTADOR?: number;
    SQ_ENTREGA_PRESTACAO?: number;
    SG_UE_PESSOA: any;
    CD_CARGO: number;
    CD_ORGAO?: number;
    TP_PESSOA: string;
    NR_TITULO_ELEITOR: string;
    NR_CPF: string;
    NR_CNPJ: any;
    NM_PESSOA: string;
    NR_PARTIDO: number;
    NR_CANDIDATO: number;
    ST_PRESTADOR_CONTA: number;
    SQ_PRESTADOR_CONTA_JE?: number;
    ST_PESSOA: string;
    NR_CRC?: any;
    NR_OAB?: any;

    TP_ENDERECO: string;
    CD_TIPO_LOGRADOURO: string;
    SG_UE: string;
    NR_LOGRADOURO: string; // numero
    DS_LOGRADOURO: string | "Rua Cel José BIbiano Siqueira"; // numero
    DS_COMPLEMENTO: string;
    DS_BAIRRO: string;
    NR_CEP: string;
    NR_TELEFONE: string;
    NR_CELULAR: string;
    NR_FAX?: string;
    NM_EMAIL: string;
};
