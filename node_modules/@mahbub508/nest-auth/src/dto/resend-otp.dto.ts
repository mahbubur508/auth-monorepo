import { IsEmail, IsEnum } from 'class-validator';
import { OtpType } from '../entities/otp-token.entity';

export class ResendOtpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsEnum(OtpType, { message: 'type must be EMAIL_VERIFY or RESET_PASSWORD' })
  type: OtpType;
}
