import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders"
import { WooviSdkClientError } from "../clientFront/types";
import { Account, Withdraw } from "./types";

function account(baseUrl: string, path: string, appId: string) {
    return {
        get: async (options?: { accountId?: string }) => {
            options ??= {};
            options.accountId ??= '';

            const response = await fetch(`${baseUrl}${path}${options.accountId}`, {
                headers: getDefaultHeaders(appId)
            });

            if (response.status === 200) {
                const result = await response.json();

                if (!options.accountId) {
                    return result as Array<Account>
                }

                return result as Account;
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
        },
        withdraw: async (options: { accountId: string, valueInCents: number }) => {
            const response = await fetch(`${baseUrl}${path}${options.accountId}`, {
                method: 'POST',
                headers: getDefaultHeaders(appId),
                body: JSON.stringify({
                    value: options.valueInCents
                })
            });

            if (response.status === 200) {
                const result = await response.json();
                return result as Withdraw;
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

export { account }