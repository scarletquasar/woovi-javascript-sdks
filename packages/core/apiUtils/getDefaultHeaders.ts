function getDefaultHeaders(appId: string) {
    return {
        'Authorization': appId,
        'Content-Type': 'application/json'
    }
}

export { getDefaultHeaders }