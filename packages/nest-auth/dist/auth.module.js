"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AuthModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const mail_service_1 = require("./mail.service");
const auth_user_entity_1 = require("./entities/auth-user.entity");
const otp_token_entity_1 = require("./entities/otp-token.entity");
const auth_options_interface_1 = require("./interfaces/auth-options.interface");
let AuthModule = AuthModule_1 = class AuthModule {
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
    static forRoot(options) {
        return {
            module: AuthModule_1,
            imports: [
                jwt_1.JwtModule.register({
                    secret: options.jwtSecret,
                    signOptions: { expiresIn: options.jwtExpiresIn ?? '1d' },
                }),
                typeorm_1.TypeOrmModule.forFeature([auth_user_entity_1.AuthUser, otp_token_entity_1.OtpToken]),
            ],
            controllers: [auth_controller_1.AuthController],
            providers: [
                auth_service_1.AuthService,
                mail_service_1.MailService,
                {
                    provide: auth_options_interface_1.AUTH_OPTIONS,
                    useValue: options,
                },
            ],
            exports: [auth_service_1.AuthService],
        };
    }
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = AuthModule_1 = __decorate([
    (0, common_1.Module)({})
], AuthModule);
