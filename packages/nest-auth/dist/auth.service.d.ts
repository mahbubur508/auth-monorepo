import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthUser } from './entities/auth-user.entity';
import { OtpToken } from './entities/otp-token.entity';
import { AuthModuleOptions } from './interfaces/auth-options.interface';
import { MailService } from './mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
export declare class AuthService {
    private readonly userRepo;
    private readonly otpRepo;
    private readonly options;
    private readonly jwtService;
    private readonly mailService;
    constructor(userRepo: Repository<AuthUser>, otpRepo: Repository<OtpToken>, options: AuthModuleOptions, jwtService: JwtService, mailService: MailService);
    private generateOtp;
    private createOtp;
    /**
     * Sends the OTP by email but never throws if SMTP isn't configured/working yet.
     * The OTP is always printed to the server console as a fallback, so you can
     * test the full flow via Postman even before setting up real SMTP credentials.
     */
    private sendOtpSafely;
    private checkResendCooldown;
    register(dto: RegisterDto): Promise<{
        success: boolean;
        message: string;
        userId: string;
        email: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        success: boolean;
        accessToken: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Look up the auth user's id/email by email. Useful when you need the
     * AuthUser.id to link your own entities (e.g. a UserProfile) to it.
     */
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
    } | null>;
    /** Look up the auth user's id/email by id. */
    findById(id: string): Promise<{
        id: string;
        email: string;
    } | null>;
}
