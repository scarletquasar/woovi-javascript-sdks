import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders";
import { WooviSdkClientError } from "../clientFront/types";
import { WooviPayment } from "./types";

function payment(baseUrl: string, path: string, appId: string) {
    return {
        createRequest: async (options: WooviPayment) => {
            const response = await fetch(`${baseUrl}${path}`, {
                headers: getDefaultHeaders(appId),
                method: 'POST'
            });

            if (response.status === 200) {
                const result = await response.json();
                return result as {
                    payment: WooviPayment & { 
                        qrCode: string,
                        status: 'CREATED' | 'FAILED' | 'CONFIRMED' | 'DENIED'
                    }
                };
            }

            if (response.status === 400) {
                const result = await response.json();
                return {
                    problem: result.error,
                    statusCode: 400,
                    wasOnline: true,
                    action: 'request'
                } as WooviSdkClientError
            }
        }
    }
}

export { payment }