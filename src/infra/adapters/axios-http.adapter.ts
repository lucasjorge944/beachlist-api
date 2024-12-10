import axios from "axios";
import IHttpAdapter from "../../_shared/adapters/http-adapter";
export default class AxiosHttpAdapter implements IHttpAdapter {
    async get(url: string, config?: any): Promise<any> {
        try {
            const { data: dataResponse } = await axios.get(url, config);
            return dataResponse;
        } catch (error) {
            if (error.isAxiosError) {
                const statusCode = error.response.status;
                const statusText = error.response.statusText;
                throw new Error(`${statusCode} - ${statusText}`);
            }
            throw error;
        }
    }

    async post(url: string, data: any, config?: any): Promise<any> {
        try {
            const { data: dataResponse } = await axios.post(url, data, config);
            return dataResponse;
        } catch (error) {
            if (error.isAxiosError) {
                const statusCode = error.response.status;
                const statusText = error.response.statusText;
                throw new Error(`${statusCode} - ${statusText}`);
            }
            throw error;
        }
    }
}
