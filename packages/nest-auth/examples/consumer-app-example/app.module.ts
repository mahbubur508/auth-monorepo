import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthUser, OtpToken } from '@mahbub508/nest-auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [AuthUser, OtpToken],
        synchronize: true, // ⚠️ only for development, disable in production
      }),
    }),

    // 👇 This is the only line needed to plug in the full auth system
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
  providers: [
    {
      // makes @IsEmail(), @MinLength() etc. in the package's DTOs actually run
      provide: APP_PIPE,
      useValue: new ValidationPipe({ whitelist: true, transform: true }),
    },
  ],
})
export class AppModule {}
