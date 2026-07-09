"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const auth_user_entity_1 = require("./entities/auth-user.entity");
const otp_token_entity_1 = require("./entities/otp-token.entity");
const auth_options_interface_1 = require("./interfaces/auth-options.interface");
const mail_service_1 = require("./mail.service");
let AuthService = class AuthService {
    constructor(userRepo, otpRepo, options, jwtService, mailService) {
        this.userRepo = userRepo;
        this.otpRepo = otpRepo;
        this.options = options;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }
    generateOtp() {
        const length = this.options.otpLength ?? 6;
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return Math.floor(min + Math.random() * (max - min)).toString();
    }
    async createOtp(email, type) {
        const expiryMinutes = this.options.otpExpiryMinutes ?? 5;
        const otp = this.generateOtp();
        // invalidate previous unused OTPs of the same type
        await this.otpRepo.update({ email, type, isUsed: false }, { isUsed: true });
        const otpEntity = this.otpRepo.create({
            email,
            otp,
            type,
            expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000),
            isUsed: false,
        });
        await this.otpRepo.save(otpEntity);
        return otp;
    }
    /**
     * Sends the OTP by email but never throws if SMTP isn't configured/working yet.
     * The OTP is always printed to the server console as a fallback, so you can
     * test the full flow via Postman even before setting up real SMTP credentials.
     */
    async sendOtpSafely(email, otp, type) {
        console.log(`\n[nest-auth] OTP for ${email} (${type}): ${otp}\n`);
        try {
            if (type === otp_token_entity_1.OtpType.EMAIL_VERIFY) {
                await this.mailService.sendVerificationOtp(email, otp);
            }
            else {
                await this.mailService.sendPasswordResetOtp(email, otp);
            }
        }
        catch (err) {
            console.warn(`[nest-auth] Could not send email (check your SMTP config). ` +
                `The OTP above was still generated and is valid — use it directly. Reason: ${err.message}`);
        }
    }
    async checkResendCooldown(email, type) {
        const cooldown = this.options.resendCooldownSeconds ?? 60;
        const recentOtp = await this.otpRepo.findOne({
            where: {
                email,
                type,
                createdAt: (0, typeorm_2.MoreThan)(new Date(Date.now() - cooldown * 1000)),
            },
            order: { createdAt: 'DESC' },
        });
        if (recentOtp) {
            throw new common_1.BadRequestException(`Please wait before requesting another OTP (cooldown: ${cooldown}s)`);
        }
    }
    // ---------- REGISTER ----------
    async register(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            email: dto.email,
            password: hashedPassword,
            isEmailVerified: false,
        });
        await this.userRepo.save(user);
        const otp = await this.createOtp(dto.email, otp_token_entity_1.OtpType.EMAIL_VERIFY);
        await this.sendOtpSafely(dto.email, otp, otp_token_entity_1.OtpType.EMAIL_VERIFY);
        return {
            success: true,
            message: 'Registration successful. Please check your email for the verification code.',
        };
    }
    // ---------- VERIFY EMAIL ----------
    async verifyEmail(dto) {
        const otpEntity = await this.otpRepo.findOne({
            where: {
                email: dto.email,
                otp: dto.otp,
                type: otp_token_entity_1.OtpType.EMAIL_VERIFY,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (!otpEntity) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (otpEntity.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        otpEntity.isUsed = true;
        await this.otpRepo.save(otpEntity);
        await this.userRepo.update({ email: dto.email }, { isEmailVerified: true });
        return { success: true, message: 'Email verified successfully. You can now log in.' };
    }
    // ---------- RESEND OTP ----------
    async resendOtp(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email');
        }
        if (dto.type === otp_token_entity_1.OtpType.EMAIL_VERIFY && user.isEmailVerified) {
            throw new common_1.BadRequestException('This email is already verified');
        }
        await this.checkResendCooldown(dto.email, dto.type);
        const otp = await this.createOtp(dto.email, dto.type);
        await this.sendOtpSafely(dto.email, otp, dto.type);
        return { success: true, message: 'A new OTP has been sent to your email.' };
    }
    // ---------- LOGIN ----------
    async login(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isEmailVerified) {
            throw new common_1.UnauthorizedException('Please verify your email before logging in');
        }
        const accessToken = this.jwtService.sign({ sub: user.id, email: user.email }, {
            secret: this.options.jwtSecret,
            expiresIn: this.options.jwtExpiresIn ?? '1d',
        });
        return {
            success: true,
            accessToken,
            user: { id: user.id, email: user.email },
        };
    }
    // ---------- FORGOT PASSWORD ----------
    async forgotPassword(dto) {
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            // Don't reveal whether the email exists — respond generically
            return {
                success: true,
                message: 'If an account with this email exists, a reset code has been sent.',
            };
        }
        await this.checkResendCooldown(dto.email, otp_token_entity_1.OtpType.RESET_PASSWORD);
        const otp = await this.createOtp(dto.email, otp_token_entity_1.OtpType.RESET_PASSWORD);
        await this.sendOtpSafely(dto.email, otp, otp_token_entity_1.OtpType.RESET_PASSWORD);
        return {
            success: true,
            message: 'If an account with this email exists, a reset code has been sent.',
        };
    }
    // ---------- RESET PASSWORD ----------
    async resetPassword(dto) {
        const otpEntity = await this.otpRepo.findOne({
            where: {
                email: dto.email,
                otp: dto.otp,
                type: otp_token_entity_1.OtpType.RESET_PASSWORD,
                isUsed: false,
            },
            order: { createdAt: 'DESC' },
        });
        if (!otpEntity) {
            throw new common_1.BadRequestException('Invalid OTP');
        }
        if (otpEntity.expiresAt < new Date()) {
            throw new common_1.BadRequestException('OTP has expired. Please request a new one.');
        }
        const user = await this.userRepo.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.NotFoundException('No account found with this email');
        }
        otpEntity.isUsed = true;
        await this.otpRepo.save(otpEntity);
        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.userRepo.save(user);
        return { success: true, message: 'Password has been reset successfully. Please log in.' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(auth_user_entity_1.AuthUser)),
    __param(1, (0, typeorm_1.InjectRepository)(otp_token_entity_1.OtpToken)),
    __param(2, (0, common_1.Inject)(auth_options_interface_1.AUTH_OPTIONS)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, jwt_1.JwtService,
        mail_service_1.MailService])
], AuthService);
