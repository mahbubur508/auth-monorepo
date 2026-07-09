import { DynamicModule } from '@nestjs/common';
import { AuthModuleOptions } from './interfaces/auth-options.interface';
export declare class AuthModule {
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
    static forRoot(options: AuthModuleOptions): DynamicModule;
}
