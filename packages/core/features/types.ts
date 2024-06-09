type Account = {
    accountId: string,
    isDefault: boolean,
    balance: {
        total: number,
        blocked: number,
        available: number
    }
}

type Transaction = {
    endToEndId: string,
    transaction: number
}

type Withdraw = {
    account: Account,
    transaction: Transaction
}

export { Account, Transaction, Withdraw }