"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const auth_options_interface_1 = require("./interfaces/auth-options.interface");
let MailService = class MailService {
    constructor(options) {
        this.options = options;
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
    get fromAddress() {
        const name = this.options.smtp.fromName ?? 'Auth Service';
        const email = this.options.smtp.fromEmail ?? this.options.smtp.user;
        return `"${name}" <${email}>`;
    }
    async sendVerificationOtp(email, otp) {
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
    async sendPasswordResetOtp(email, otp) {
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
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(auth_options_interface_1.AUTH_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], MailService);
