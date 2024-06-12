type WooviAccount = {
    accountId: string,
    isDefault: boolean,
    balance: {
        total: number,
        blocked: number,
        available: number
    }
}

type WooviTransaction = {
    endToEndId: string,
    transaction: number
}

type WooviWithdraw = {
    account: WooviAccount,
    transaction: WooviTransaction
}

type WooviChargeDeletion = {
    status: string,
    id: string
}

type WooviTaxId = {
    type: 'BR:CPF' | 'BR:CNPJ',
    taxId: string
}

type WooviCustomer = {
    name?: string,
    email?: string,
    phone?: string,
    taxId?: WooviTaxId,
    correlationId?: string,
    address?: string
}

type WooviCharge = {
    status: string,
    customer: WooviCustomer,
    value: number,
    comment: string,
    correlationId: string,
    paymentLinkId: string,
    paymentLinkUrl: string,
    globalId: string,
    qrCodeImage: string,
    brCode: string,
    additionalInfo: Array<{
        key: string,
        value: string
    }>,
    expiresIn: number,
    expiresDate: string,
    createdAt: string,
    updatedAt: string
}

type WooviPagination = {
    pageInfo: {
        skip: number,
        limit: number,
        totalCount: number,
        hasPreviousPage: boolean,
        hasNextPage: boolean
    }
}

export { 
    WooviPagination,
    WooviAccount, 
    WooviTransaction, 
    WooviWithdraw, 
    WooviChargeDeletion,
    WooviCharge,
    WooviCustomer
}