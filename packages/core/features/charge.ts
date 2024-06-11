import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders";
import { WooviSdkClientError } from "../clientFront/types";
import { WooviCharge, WooviChargeDeletion, WooviCustomer } from "./types";

type WooviCreateChargeOptions = {
    correlationId: string,
    value: number,
    type?: 'DYNAMIC' | 'OVERDUE',
    comment?: string,
    expiresIn?: number,
    expiresDate?: string,
    customer: WooviCustomer,
    daysForDueDate?: number,
    daysAfterDueDate?: number,
    interests?: {
        values?: number
    },
    fines?: {
        values?: number
    },
    discountSettings?: {
        modality?: string,
        discountFixedDate?: Array<{
            daysActive?: number,
            value?: number
        }>
    },
    additionalInfo?: Array<{
        key?: string,
        value?: string
    }>,
    enableCashbackPercentage?: boolean,
    enableCashbackExclusivePercentage?: boolean,
    subaccount?: string,
    splits?: Array<{
        value: string,
        pixKey: string,
        splitType: 'SPLIT_INTERNAL_TRANSFER' | 'SPLIT_SUB_ACCOUNT' | 'SPLIT_PARTNER' 
    }>

}

function charge(baseUrl: string, path: string, appId: string) {
    return {
        /**
         * @method Returns one or more charges
         * @param {Object} options - The options for returning **one charge**.
         *      - id: The id of the charge to be called
         * @param {Object} options - The options for returning **an interval of charges**.
         *      - start?: Date time of the start of the interval
         *      - end?: Date time of the end of the interval
         *      - status?: Filter for the status of the returned charges
         *      - customer?: Customer CorrelationId
         * @example 
         * // Get one charge
         * const result = await client
         *  .charge
         *  .get({ 
         *      id: '97b8e10a-b3fb-41ae-b089-571ce174cceb' 
         *  });
         * 
         * const charge = result[0];
         * 
         * @example 
         * // Get multiple charges
         * const charges = await client
         *  .accounts
         *  .get({
         *      start: '2020-06-09T18:44:06.324Z',
         *      end: '2024-06-09T18:44:06.324Z',
         *      status: 'ACTIVE',
         *      customer: 'a841224a-b5c4-4a00-9688-7263a848f810'
         *  });
         */
        get: async (options?: { 
            id: string 
        } | {
            start?: string,
            end?: string,
            status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED',
            customer?: string
        }): Promise<Array<WooviCharge> | WooviSdkClientError> => {
            // TODO: ADD PAGINATION SUPPORT AND FIX THE RESPONSE
            // TYPING TO ATTEND THE API
            const response = (options as { id: string }).id 
                ? await fetch(`${baseUrl}${path}${(options as { id: string }).id}`, {
                    headers: getDefaultHeaders(appId)
                })
                : await (() => async () => {
                    const typesafeOptions = options as {
                        start?: string,
                        end?: string,
                        status?: 'ACTIVE' | 'COMPLETED' | 'EXPIRED',
                        customer?: string
                    };

                    const queryParams = new URLSearchParams(typesafeOptions);

                    return await fetch(`${baseUrl}${path}?${queryParams.toString()}`, {
                        headers: getDefaultHeaders(appId)
                    })
                })()();

            if (response.status === 200) {
                const result = await response.json();
                return result.data;
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
         * @method Deletes one charge
         * @param {Object} options - The options for deleting one charge.
         *      - chargeOrCorrelationId: The charge id or correlation id of the charge to be deleted
         * @example 
         * // Delete one charge
         * const result = await client
         *  .charge
         *  .delete({ 
         *      chargeOrCorrelationId: '97b8e10a-b3fb-41ae-b089-571ce174cceb' 
         *  });
         */
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
        },
        create: async (options:  WooviCreateChargeOptions) => {
            const response = await fetch(`${baseUrl}${path}`, {
                body: JSON.stringify(options),
                headers: getDefaultHeaders(appId)
            });

            if (response.status === 200) {
                const result = await response.json();
                return result.data;
            }
        }
    }
}

export { charge }