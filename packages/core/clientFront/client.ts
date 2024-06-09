import { account } from "../features/account";
import { WooviSdkClientOptions, WooviSdkClientError } from "./types";

class WooviSdkClient {
    private baseUrl = "https://api.openpix.com.br";
    private accountUrl = "/api/v1/account/";
    private cashbackFidelityUrl = "/api/v1/cashback-fidelity/";
    private chargeUrl = "/api/v1/charge/";
    private customerUrl = "/api/v1/customer/";
    private partnerUrl = "/api/v1/partner/";
    private paymentUrl = "/api/v1/payment/";
    private pixQrCodeUrl = "/api/v1/qrcode-static/";
    private refundUrl = "/api/v1/refund/";
    private subscriptionUrl = "/api/v1/subscriptions/";
    private transactionsUrl = "/api/v1/transaction/";
    private transferUrl = "/api/v1/transfer";
    private webhookUrl = "/api/v1/webhook/";
    private subaccountUrl = "/api/v1/subaccount/";

    private appId: string;

    constructor(options: WooviSdkClientOptions) {
        this.appId = options.appId;
        
        this.account = account(
            this.baseUrl, 
            this.accountUrl, 
            this.appId
        );
    }

    public account: ReturnType<typeof account>;
}

function createClient(options: WooviSdkClientOptions) {
    if (!options.appId) {
        return {
            problem: 'AppId Inválido',
            action: 'configuration',
            wasOnline: false
        } as WooviSdkClientError
    }

    return new WooviSdkClient({ appId: options.appId });
}

export { createClient }
