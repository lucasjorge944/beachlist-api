import IHttpAdapter from "../../../_shared/adapters/http-adapter";
import {
    AddressResponse,
    IConsultAddressGateway
} from "../../../domain/gateway/consult-address.gateway.interface";

export class ViaCepHttpGateway implements IConsultAddressGateway {
    constructor(private readonly httpAdapter: IHttpAdapter) {}

    public async getAddress(CEPs: string[]): Promise<AddressResponse[]> {
        if (!CEPs?.length) return [];
        const CEPSToConsult: string[] = [];
        for (let cep of CEPs) {
            if (!cep) continue;
            if (!CEPSToConsult.includes(cep)) CEPSToConsult.push(cep);
        }
        const promisses: any = CEPSToConsult.map(
            (cep) => new Promise((resolve, _) => resolve(this.consult(cep)))
        );
        const addressList: AddressResponse[] = await Promise.all(promisses);
        return addressList;
    }

    private async consult(cep): Promise<AddressResponse> {
        try {
            return await this.httpAdapter.get(
                `https://viacep.com.br/ws/${cep}/json`,
                {}
            );
        } catch (error) {
            return null;
        }
    }
}
