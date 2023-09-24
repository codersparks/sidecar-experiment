import express from "express";
import axios, {Method, AxiosResponse, AxiosError, AxiosHeaders} from "axios";


export const axiosResponseToExpress = async (axiosResponse: AxiosResponse, expressResponse: express.Response): Promise<express.Response> => {
    return expressResponse.status(axiosResponse.status).header(axiosResponse.headers).send(axiosResponse.data);
}

export const axiosErrorToExpress = async (axiosError: AxiosError,  expressResponse: express.Response): Promise<express.Response> => {

    console.log(`Error Status: ${axiosError}`);

    const status = axiosError.status || 500;
    return expressResponse.status(status).header(axiosError.request.headers).send(axiosError.message);
}

export const proxyExpressRequest = async (baseUrl: string, request: express.Request, expressResponse: express.Response) => {

    const proxiedUrl = `${baseUrl}${request.path}`;
    console.log(`Proxied Request URL: ${proxiedUrl}`);
    return axios({
        url: proxiedUrl,
        method: request.method as Method,
        headers: request.headers,
        params: request.params,
        data: request.body
    }).then(axiosResponse => {
        return axiosResponseToExpress(axiosResponse, expressResponse );
    }).catch(({response}) => {
        console.log(`Response data: ${response.data}`)
        console.log(`Response status: ${response.status}`)
        console.log(`Response headers: ${response.headers}`)
        return axiosResponseToExpress(response, expressResponse);
    });
}