import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders"
import { WooviSdkClientError } from "../clientFront/types";
import { WooviAccount, WooviWithdraw } from "./types";

function account(baseUrl: string, path: string, appId: string) {
    return {
        /**
         * @method Returns one or more accounts
         * @param {Object} options - The options for the call.
         *      - accountId?: The id of the account to be called, if undefined, 
         *      the call will return a list of accounts.
         * @example 
         * // Get one account
         * const result = await client
         *  .accounts
         *  .get({ 
         *      accountId: '97b8e10a-b3fb-41ae-b089-571ce174cceb' 
         *  });
         * 
         * const account = result[0];
         * 
         * @example 
         * // Get multiple accounts
         * const accounts = await client
         *  .accounts
         *  .get();
         * 
         * @example
         * // Get multiple accounts
         * const accounts = await client
         *  .accounts
         *  .get({});
         */
        get: async (options?: { accountId?: string }): Promise<Array<WooviAccount> | WooviSdkClientError> => {
            options ??= {};
            options.accountId ??= '';

            const response = await fetch(`${baseUrl}${path}/${options.accountId}`, {
                headers: getDefaultHeaders(appId)
            });

            if (response.status === 200) {
                const result = await response.json();

                if (!options.accountId) {
                    return result
                }

                return [result];
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
        /**
         * @method Withdraw from one account
         * @param {Object} options - The options for the call.
         *      - accountId?: The id of the account to be called, if undefined, 
         *      the call will return a list of accounts.
         *      - valueInCents: The value in cents to withdraw from the account.
         * @example 
         * // Withdraw from account
         * const account: Withdraw = await client
         *  .accounts
         *  .withdraw({ 
         *      accountId: '97b8e10a-b3fb-41ae-b089-571ce174cceb',
         *      valueInCents: 20000
         *  });
         */
        withdraw: async (options: { accountId: string, valueInCents: number }) => {
            const response = await fetch(`${baseUrl}${path}/${options.accountId}`, {
                method: 'POST',
                headers: getDefaultHeaders(appId),
                body: JSON.stringify({
                    value: options.valueInCents
                })
            });

            if (response.status === 200) {
                const result = await response.json();
                return result as WooviWithdraw;
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