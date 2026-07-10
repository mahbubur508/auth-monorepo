import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { AuthUser } from './entities/auth-user.entity';
import { OtpToken } from './entities/otp-token.entity';
import { AUTH_OPTIONS, AuthModuleOptions } from './interfaces/auth-options.interface';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({})
export class AuthModule {
  /**
   * Import this in your NestJS app's root module like:
   *
   * AuthModule.forRoot({
   *   jwtSecret: process.env.JWT_SECRET,
   *   smtp: {
   *     host: process.env.SMTP_HOST,
   *     user: process.env.SMTP_USER,
   *     pass: process.env.SMTP_PASS,
   *   },
   * })
   */
  static forRoot(options: AuthModuleOptions): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        JwtModule.register({
          secret: options.jwtSecret,
          signOptions: { expiresIn: options.jwtExpiresIn ?? '1d' },
        }),
        TypeOrmModule.forFeature([AuthUser, OtpToken]),
        PassportModule,
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        MailService,
        {
          provide: AUTH_OPTIONS,
          useValue: options,
        },
        JwtStrategy,
      ],
      exports: [AuthService, JwtStrategy, PassportModule],
    };
  }
}
