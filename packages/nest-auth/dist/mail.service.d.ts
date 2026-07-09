import { AuthModuleOptions } from './interfaces/auth-options.interface';
export declare class MailService {
    private readonly options;
    private transporter;
    constructor(options: AuthModuleOptions);
    private get fromAddress();
    sendVerificationOtp(email: string, otp: string): Promise<void>;
    sendPasswordResetOtp(email: string, otp: string): Promise<void>;
}
