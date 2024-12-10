import IHttpAdapter from "../../../_shared/adapters/http-adapter";
import { ConvertGander } from "../../../_shared/utils/convert-gander";
import {
    IConsultPersonInformationGateway,
    PersonInformation
} from "../../../domain/gateway/consult-person-information.gateway.interface";

export class BigdatacorpHttpGateway
    implements IConsultPersonInformationGateway
{
    declare accessToken: string;
    constructor(private readonly httpAdapter: IHttpAdapter) {
        this.accessToken = process.env.bigdatacorpaccessToken;
        console.log("TOKEN", this.accessToken);
    }

    async getByDocument(docuemnt: string): Promise<PersonInformation> {
        const url = `https://plataforma.bigdatacorp.com.br/pessoas`;
        try {
            const response = await this.httpAdapter.post(
                url,
                {
                    Datasets: "basic_data",
                    q: `doc{${docuemnt}}`
                },
                {
                    headers: {
                        AccessToken: this.accessToken,
                        tokenId: "65383274f6e59e0008bb27f9"
                    }
                }
            );
            console.log(JSON.stringify(response));
            const data = response?.Result?.[0];
            if (!data) return null;

            const personInformation = {
                name: data?.BasicData?.Name,
                gender: ConvertGander.abbreviatedToComplete(
                    data?.BasicData?.Gender
                ),
                birthDate: new Date(data?.BasicData?.BirthDate)
            };
            return personInformation;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
