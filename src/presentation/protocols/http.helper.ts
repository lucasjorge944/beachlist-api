import { InvalidProps, MissingParamError } from "../../domain/erros";
import { HttpResponse } from "./http.interface";

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};
export const badRequest = (error: Error): HttpResponse => ({
    statusCode: 400,
    headers: headers,
    body: JSON.stringify({ name: error.name, message: error.message })
});

export const notFound = (): HttpResponse => ({
    statusCode: 404,
    headers: headers,
    body: JSON.stringify({ message: "Nenhum registro encontrado" })
});

export const forbidden = (error: Error): HttpResponse => ({
    statusCode: 403,
    headers: headers,
    body: JSON.stringify(error)
});

export const serverError = (error: Error): HttpResponse => {
    console.log(error);
    if (error instanceof InvalidProps || error instanceof MissingParamError) {
        return badRequest(error);
    }

    return {
        statusCode: 500,
        headers: headers,
        body: JSON.stringify({ name: error.name, message: error.message })
    };
};

export const ok = (data: any): HttpResponse => ({
    statusCode: 200,
    headers: headers,
    body: JSON.stringify(data)
});

export const noContent = (): HttpResponse => ({
    statusCode: 204,
    headers: headers,
    body: JSON.stringify({})
});
