import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthUser, OtpToken } from '@mahbub508/nest-auth';
import { UserProfile } from './users/user-profile.entity';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // SQLite is used here purely so the demo runs instantly with zero setup.
    // Swap this for Postgres/MySQL in a real project (see README).
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'auth-demo.sqlite',
      entities: [AuthUser, OtpToken, UserProfile],
      synchronize: true, // dev only
    }),

    TypeOrmModule.forFeature([UserProfile]),

    AuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN,
      smtp: {
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        fromName: process.env.SMTP_FROM_NAME,
        fromEmail: process.env.SMTP_FROM_EMAIL,
      },
      otpExpiryMinutes: +(process.env.OTP_EXPIRY_MINUTES ?? 5),
      resendCooldownSeconds: +(process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60),
      otpLength: +(process.env.OTP_LENGTH ?? 6),
    }),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule {}
