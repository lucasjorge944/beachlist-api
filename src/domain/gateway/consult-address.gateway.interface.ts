export interface IConsultAddressGateway {
    getAddress(CEPs: string[]): Promise<AddressResponse[]>;
}

export type AddressResponse = {
    cep: string;
    logradouro?: string;
    complemento?: string;
    unidade?: string;
    bairro?: string;
    localidade?: string;
    uf: string | "MG";
    ibge?: string;
    gia?: string;
    ddd?: string;
    siafi?: string;
};
