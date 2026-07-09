export interface SmtpOptions {
  host: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass: string;
  fromName?: string;
  fromEmail?: string;
}

export interface AuthModuleOptions {
  /** Secret used to sign JWT access tokens */
  jwtSecret: string;
  /** JWT expiry, e.g. '1d', '15m' */
  jwtExpiresIn?: string;
  /** SMTP configuration used to send OTP emails */
  smtp: SmtpOptions;
  /** OTP validity duration in minutes (default: 5) */
  otpExpiryMinutes?: number;
  /** Minimum seconds a user must wait before requesting another OTP (default: 60) */
  resendCooldownSeconds?: number;
  /** Number of digits in the generated OTP (default: 6) */
  otpLength?: number;
}

export const AUTH_OPTIONS = 'AUTH_OPTIONS';
