import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthUser } from './entities/auth-user.entity';
import { OtpToken, OtpType } from './entities/otp-token.entity';
import { AUTH_OPTIONS, AuthModuleOptions } from './interfaces/auth-options.interface';
import { MailService } from './mail.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthUser) private readonly userRepo: Repository<AuthUser>,
    @InjectRepository(OtpToken) private readonly otpRepo: Repository<OtpToken>,
    @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private generateOtp(): string {
    const length = this.options.otpLength ?? 6;
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min)).toString();
  }

  private async createOtp(email: string, type: OtpType): Promise<string> {
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
  private async sendOtpSafely(email: string, otp: string, type: OtpType) {
    console.log(`\n[nest-auth] OTP for ${email} (${type}): ${otp}\n`);
    try {
      if (type === OtpType.EMAIL_VERIFY) {
        await this.mailService.sendVerificationOtp(email, otp);
      } else {
        await this.mailService.sendPasswordResetOtp(email, otp);
      }
    } catch (err) {
      console.warn(
        `[nest-auth] Could not send email (check your SMTP config). ` +
          `The OTP above was still generated and is valid — use it directly. Reason: ${err.message}`,
      );
    }
  }

  private async checkResendCooldown(email: string, type: OtpType) {
    const cooldown = this.options.resendCooldownSeconds ?? 60;
    const recentOtp = await this.otpRepo.findOne({
      where: {
        email,
        type,
        createdAt: MoreThan(new Date(Date.now() - cooldown * 1000)),
      },
      order: { createdAt: 'DESC' },
    });
    if (recentOtp) {
      throw new BadRequestException(
        `Please wait before requesting another OTP (cooldown: ${cooldown}s)`,
      );
    }
  }

  // ---------- REGISTER ----------
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      isEmailVerified: false,
    });
    await this.userRepo.save(user);

    const otp = await this.createOtp(dto.email, OtpType.EMAIL_VERIFY);
    await this.sendOtpSafely(dto.email, otp, OtpType.EMAIL_VERIFY);

    return {
      success: true,
      message: 'Registration successful. Please check your email for the verification code.',
      userId: user.id,
      email: user.email,
    };
  }

  // ---------- VERIFY EMAIL ----------
  async verifyEmail(dto: VerifyEmailDto) {
    const otpEntity = await this.otpRepo.findOne({
      where: {
        email: dto.email,
        otp: dto.otp,
        type: OtpType.EMAIL_VERIFY,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpEntity) {
      throw new BadRequestException('Invalid OTP');
    }
    if (otpEntity.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    otpEntity.isUsed = true;
    await this.otpRepo.save(otpEntity);

    await this.userRepo.update({ email: dto.email }, { isEmailVerified: true });

    return { success: true, message: 'Email verified successfully. You can now log in.' };
  }

  // ---------- RESEND OTP ----------
  async resendOtp(dto: ResendOtpDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }
    if (dto.type === OtpType.EMAIL_VERIFY && user.isEmailVerified) {
      throw new BadRequestException('This email is already verified');
    }

    await this.checkResendCooldown(dto.email, dto.type);
    const otp = await this.createOtp(dto.email, dto.type);
    await this.sendOtpSafely(dto.email, otp, dto.type);

    return { success: true, message: 'A new OTP has been sent to your email.' };
  }

  // ---------- LOGIN ----------
  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: this.options.jwtSecret,
        expiresIn: (this.options.jwtExpiresIn ?? '1d') as any,
      },
    );

    return {
      success: true,
      accessToken,
      user: { id: user.id, email: user.email },
    };
  }

  // ---------- FORGOT PASSWORD ----------
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      // Don't reveal whether the email exists — respond generically
      return {
        success: true,
        message: 'If an account with this email exists, a reset code has been sent.',
      };
    }

    await this.checkResendCooldown(dto.email, OtpType.RESET_PASSWORD);
    const otp = await this.createOtp(dto.email, OtpType.RESET_PASSWORD);
    await this.sendOtpSafely(dto.email, otp, OtpType.RESET_PASSWORD);

    return {
      success: true,
      message: 'If an account with this email exists, a reset code has been sent.',
    };
  }

  // ---------- RESET PASSWORD ----------
  async resetPassword(dto: ResetPasswordDto) {
    const otpEntity = await this.otpRepo.findOne({
      where: {
        email: dto.email,
        otp: dto.otp,
        type: OtpType.RESET_PASSWORD,
        isUsed: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpEntity) {
      throw new BadRequestException('Invalid OTP');
    }
    if (otpEntity.expiresAt < new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('No account found with this email');
    }

    otpEntity.isUsed = true;
    await this.otpRepo.save(otpEntity);

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);

    return { success: true, message: 'Password has been reset successfully. Please log in.' };
  }

  // ---------- HELPERS FOR CONSUMER APPS ----------
  /**
   * Look up the auth user's id/email by email. Useful when you need the
   * AuthUser.id to link your own entities (e.g. a UserProfile) to it.
   */
  async findByEmail(email: string): Promise<{ id: string; email: string } | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    return user ? { id: user.id, email: user.email } : null;
  }

  /** Look up the auth user's id/email by id. */
  async findById(id: string): Promise<{ id: string; email: string } | null> {
    const user = await this.userRepo.findOne({ where: { id } });
    return user ? { id: user.id, email: user.email } : null;
  }
}
