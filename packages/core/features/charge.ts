import { getDefaultHeaders } from "../apiUtils/getDefaultHeaders";
import { WooviSdkClientError } from "../clientFront/types";
import { WooviCharge, WooviChargeDeletion, WooviCustomer, WooviPagination } from "./types";

type WooviCreateChargeOptions = {
    returnExisting?: boolean,
    correlationId: string,
    value: number,
    type?: 'DYNAMIC' | 'OVERDUE',
    comment?: string,
    expiresIn?: number,
    expiresDate?: string,
    customer?: WooviCustomer,
    daysForDueDate?: number,
    daysAfterDueDate?: number,
    interests?: {
        values?: number
    },
    fines?: {
        values?: number
    },
    discountSettings?: {
        modality?: "FIXED_VALUE_UNTIL_SPECIFIED_DATE" | "PERCENTAGE_UNTIL_SPECIFIED_DATE",
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
};

type WooviChargePagination = WooviPagination & { charges: Array<WooviCharge> };

type WooviCreateChargeReturn = {
    correlationID: string,
    value: number,
    comment: string,
    customer: WooviCustomer,
    additionalInfo: Array<{
        key?: string,
        value?: string
    }> 
};

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
            customer?: string,
            skip?: number,
            limit?: number
        }): Promise<WooviChargePagination | WooviSdkClientError> => {
            const response = (options as { id: string }).id 
                ? await fetch(`${baseUrl}${path}${(options as { id: string }).id}`, {
                    headers: getDefaultHeaders(appId)
                })
                : await (async () => {
                    const typesafeOptions = {
                        ...options,
                        skip: (<{ skip: number}>options).skip?.toString(),
                        limit: (<{ limit: number}>options).limit?.toString()
                    } as {
                        skip: string;
                        limit: string;
                        start?: string;
                        end?: string;
                        status?: "ACTIVE" | "COMPLETED" | "EXPIRED";
                        customer?: string;
                    };

                    const queryParams = new URLSearchParams(typesafeOptions);

                    return await fetch(`${baseUrl}${path}?${queryParams.toString()}`, {
                        headers: getDefaultHeaders(appId)
                    })
                })();

            if (response.status === 200 && (<{ id: string }>options).id) {
                const result = await response.json();
                return {
                    pageInfo: {
                        skip: 0,
                        limit: 1,
                        totalCount: 1,
                        hasPreviousPage: false,
                        hasNextPage: false
                    },
                    charges: [result.data]
                };
            }

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
         * @param {Object} options The options for deleting one charge.
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
        /**
         * @method Creates one charge
         * @param {Object} options The options for creating the charge
         *      - returnExisting?: Make the endpoint **idempotent**, will return an existent charge if already has a one with the correlationID. Default is `true`
         *      - correlationId: The correlation ID for the charge, an unique ID like UUID is recommended
         *      - value: The value of the charge in cents
         *      - type: Defines the type of the charge. Default is `'DYNAMIC'`
         *      - comment: A comment for the charge
         *      - expiresIn: The amount of time to pass before expiring in milisseconds
         *      - expiresDate: The string representation of the expiration date
         *      - customer: Customer field is not required. However, if you decide to send it, you must send at least one of the following combinations, name + taxID or name + email or name + phone
         *      - daysForDueDate: Time in days until the charge hits the deadline so fines and interests start applying. This property is only considered for charges of type OVERDUE
         *      - daysAfterDueDate: Time in days that a charge is still payable after the deadline. This property is only considered for charges of type OVERDUE
         *      - interests: Interests configuration. This property is only considered for charges of type OVERDUE
         *      - fines: Fines configuration. This property is only considered for charges of type OVERDUE
         *      - discountSettings: Discount settings for the charge. This property is only considered for charges of type OVERDUE
         *      - additionalInfo: Additional info of the charge
         *      - enableCashbackPercentage: `true` to enable cashback and `false` to disable
         *      - enableCashbackExclusivePercentage: `true` to enable fidelity cashback and `false` to disable
         *      - subaccount: Pix key of the subaccount to receive the charge
         *      - splits: This is the array that will configure how will be splitted the value of the charge
         * @example 
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
        create: async (options: WooviCreateChargeOptions): Promise<WooviCreateChargeReturn | WooviSdkClientError> => {
            const returnExisting = options.returnExisting ?? true;
            delete options.returnExisting;

            const response = await fetch(`${baseUrl}${path}?returnExisting=${returnExisting}`, {
                body: JSON.stringify(options),
                headers: getDefaultHeaders(appId)
            });

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
        }
    }
}

export { charge }