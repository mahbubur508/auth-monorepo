// examples/extending-with-profile/register-with-profile.dto.ts

import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterWithProfileDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  // 👇 your extra fields
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
