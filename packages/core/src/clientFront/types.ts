interface WooviSdkClientError {
    problem: string,
    action: 'configuration' | 'request' | 'unknown',
    wasOnline: boolean,
    statusCode?: number
}

interface WooviSdkClientOptions {
    appId: string
}

export { WooviSdkClientError, WooviSdkClientOptions }