import { WooviSdkClientError } from "../clientFront/types";
import { getDefaultHeaders } from "./getDefaultHeaders";

interface QueryParams {
    query: Record<string, string | number>
}

type WrapperParams = {body?: unknown} & QueryParams
type FetcherResponse<T> = Response & {data: T}

export default function fetcher(options: {appId: string, baseUrl: string}){
    const appendQueryParamsToUrl = (
		url: string,
		queryParams?: Record<string, string | number>,
	): string => {
		if (!queryParams) return url;

		const searchParams = new URLSearchParams();

		for (const key in queryParams) {
			if (Object.prototype.hasOwnProperty.call(queryParams, key)) {
				searchParams.append(key, queryParams[key].toString());
			}
		}

		return url.includes('?')
			? `${url}&${searchParams.toString()}`
			: `${url}?${searchParams.toString()}`;
	}

    const wrapper = (method: "POST" | "PUT" | "GET" | "DELETE" | "PATCH" = "GET") => async <T>(path: string, data: WrapperParams): Promise<FetcherResponse<T> | WooviSdkClientError> => {
        const headers = getDefaultHeaders(options.appId);
        const url: string = appendQueryParamsToUrl(`${options.baseUrl}${path}`, data.query);

        const requestInitParams: RequestInit = {
            method,
            headers,
            body: JSON.stringify(data.body)
        }

        try {

            const Response = await fetch(url, requestInitParams);
            const ResponseJson = await Response.json();

            
            if(Response.ok){
                return {...Response, data: ResponseJson}
            }
            
            return { action: "request", problem: ResponseJson.error, wasOnline: true, statusCode: Response.status} as WooviSdkClientError
        } catch(error: unknown) {
            return { action: "unknown", problem: "Something unexpected happened on fetch api.", wasOnline: true, statusCode: 500} as WooviSdkClientError
        }
    }

    return {
        get: wrapper("GET"),
        post: wrapper("POST"),
        put: wrapper("PUT"),
        delete: wrapper("DELETE"),
        patch: wrapper("PATCH"),
    }
}