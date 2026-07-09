export declare enum OtpType {
    EMAIL_VERIFY = "EMAIL_VERIFY",
    RESET_PASSWORD = "RESET_PASSWORD"
}
export declare class OtpToken {
    id: string;
    email: string;
    otp: string;
    type: OtpType;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
}
