import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders";
import { WooviSdkClientError } from "../clientFront/types";
import { WooviChargeDeletion } from "./types";

function charge(baseUrl: string, path: string, appId: string) {
    return {
        delete: async (options: { chargeOrCorrelationId: string }) => {
            const response = await fetch(`${baseUrl}${path}${options.chargeOrCorrelationId}`, {
                headers: getDefaultHeaders(appId)
            });
            
            if (response.status === 200) {
                const result = await response.json();
                return result as WooviChargeDeletion;
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

            return {
                problem: await response.text(),
                statusCode: response.status,
                wasOnline: true,
                action: 'request'
            } as WooviSdkClientError
        }
    }
}