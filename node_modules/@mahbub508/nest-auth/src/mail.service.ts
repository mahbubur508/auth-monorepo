import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AUTH_OPTIONS, AuthModuleOptions } from './interfaces/auth-options.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(@Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions) {
    this.transporter = nodemailer.createTransport({
      host: this.options.smtp.host,
      port: this.options.smtp.port ?? 587,
      secure: this.options.smtp.secure ?? false,
      auth: {
        user: this.options.smtp.user,
        pass: this.options.smtp.pass,
      },
    });
  }

  private get fromAddress(): string {
    const name = this.options.smtp.fromName ?? 'Auth Service';
    const email = this.options.smtp.fromEmail ?? this.options.smtp.user;
    return `"${name}" <${email}>`;
  }

  async sendVerificationOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire soon. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetOtp(email: string, otp: string): Promise<void> {
    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
  }
}
