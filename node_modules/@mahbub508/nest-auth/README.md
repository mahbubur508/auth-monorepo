# @mahbub508/nest-auth

A plug-and-play, globally reusable **NestJS authentication package**.
Install it in any NestJS project and get a complete auth system in one line:

- ✅ Register
- ✅ Email verification (OTP)
- ✅ Resend OTP (with cooldown)
- ✅ Login (JWT)
- ✅ Forgot Password
- ✅ Reset Password

---

## ⚠️ Important: this folder is a LIBRARY, not a server

`packages/nest-auth` has **no `start` script on purpose** — it's a reusable package meant to be
`import`-ed into a real NestJS app, the same way you'd use `@nestjs/jwt` or any npm library.
Running `npm start` or `npm run dev` here will always fail with "Missing script".

**To actually run a server and test in Postman, use `packages/auth-demo-app`** — a small, complete,
already-working NestJS server included in this repo that imports this library. Quick start:

```bash
# from the monorepo root
npm install
npm run build:lib          # compiles packages/nest-auth -> dist/
cd packages/auth-demo-app
npm run build
npm start                  # or: npm run start:dev for auto-reload
```

Server boots on `http://localhost:3000`. It uses SQLite (zero setup, no Postgres needed) and
**prints every OTP straight to the terminal**, so you can test the entire flow in Postman before
you've even configured a real SMTP provider. Try:

```bash
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test@1234\"}"
```

Then check the terminal for a line like `[nest-auth] OTP for test@example.com (EMAIL_VERIFY): 584650`.

Once you've verified this works, wiring the library into your **own** NestJS project follows the
same pattern shown in `packages/auth-demo-app/src/app.module.ts` — just swap SQLite for your real
database and fill in real SMTP credentials.

---

## 1. Installation (in a consumer project)

```bash
npm install @mahbub508/nest-auth
# peer dependencies (install once per project if not already present)
npm install @nestjs/jwt @nestjs/typeorm typeorm reflect-metadata rxjs
npm install class-validator class-transformer   # required by ValidationPipe for DTO validation
npm install pg   # or mysql2 / sqlite3 depending on your DB
```

## 2. Setup `.env`

Copy `.env.example` from this repo and fill in your own values (DB, JWT secret, SMTP).
For quick testing without a real mailbox, use [Mailtrap.io](https://mailtrap.io) sandbox SMTP.

## 3. Wire it into your `AppModule`

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule, AuthUser, OtpToken } from '@mahbub508/nest-auth';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [AuthUser, OtpToken],
      synchronize: true, // dev only
    }),

    AuthModule.forRoot({
      jwtSecret: process.env.JWT_SECRET,
      smtp: {
        host: process.env.SMTP_HOST,
        port: +process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }),
  ],
})
export class AppModule {}
```

That's it — 6 endpoints are now live under `/auth/*`.

⚠️ **Important:** enable a global `ValidationPipe` in your `main.ts` so the package's
built-in DTO validation (`@IsEmail`, `@MinLength`, etc.) actually runs:

```ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
```

See `examples/consumer-app-example/app.module.ts` for a full working example.

---

## 4. Available Endpoints

| Method | Endpoint                 | Body                                          |
|--------|---------------------------|------------------------------------------------|
| POST   | `/auth/register`          | `{ email, password }`                          |
| POST   | `/auth/verify-email`      | `{ email, otp }`                               |
| POST   | `/auth/resend-otp`        | `{ email, type: "EMAIL_VERIFY" \| "RESET_PASSWORD" }` |
| POST   | `/auth/login`             | `{ email, password }`                          |
| POST   | `/auth/forgot-password`   | `{ email }`                                    |
| POST   | `/auth/reset-password`    | `{ email, otp, newPassword }`                  |

All responses are consistent JSON:
```json
{ "success": true, "message": "..." }
```
or on error:
```json
{ "statusCode": 400, "message": "Invalid OTP" }
```

---

## 5. How to build & publish this package globally (npm)

```bash
cd nest-auth
npm install
npm run build          # compiles src/ -> dist/
npm login              # login to your npmjs.com account
npm publish --access public
```

Once published, **anyone in the world** can install it with:
```bash
npm install @mahbub508/nest-auth
```

To publish an update later: bump the `version` in `package.json` (semver), then `npm publish` again.

---

## 6. Frontend usage (Next.js)

See `examples/nextjs-usage/useAuth.ts` for a ready-made React hook that calls these
endpoints from any Next.js app using `axios`. Just set:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 7. Testing with Postman

A ready-to-import collection is included: **`postman_collection.json`**

Steps:
1. Open Postman → **Import** → select `postman_collection.json`.
2. Update the collection variable `base_url` if your server doesn't run on `localhost:3000`.
3. Run requests **in order**:
   1. Register
   2. Check your Mailtrap inbox (or console logs) for the OTP, paste it into "Verify Email"
   3. Login → the `token` variable auto-saves from the response (via a Postman test script)
   4. Try Forgot Password → Reset Password flow the same way
   5. Use "Resend OTP" any time you need a fresh code (cooldown applies)

---

## 8. Configuration Options (`AuthModule.forRoot(options)`)

| Option                   | Type     | Default | Description                                  |
|---------------------------|----------|---------|-----------------------------------------------|
| `jwtSecret`                | string   | —       | Secret to sign JWT tokens                     |
| `jwtExpiresIn`              | string   | `'1d'`  | JWT expiry                                    |
| `smtp`                      | object   | —       | `{ host, port, user, pass, fromName, fromEmail }` |
| `otpExpiryMinutes`          | number   | `5`     | OTP validity window                           |
| `resendCooldownSeconds`     | number   | `60`    | Minimum wait between OTP resend requests      |
| `otpLength`                 | number   | `6`     | Number of digits in generated OTP             |

---

## 9. Folder Structure

```
nest-auth/
├── src/
│   ├── auth.module.ts        (DynamicModule — forRoot() entrypoint)
│   ├── auth.controller.ts    (all REST endpoints)
│   ├── auth.service.ts       (all business logic)
│   ├── mail.service.ts       (nodemailer email sending)
│   ├── entities/             (TypeORM entities: AuthUser, OtpToken)
│   ├── dto/                  (validated request bodies)
│   ├── interfaces/           (AuthModuleOptions config type)
│   └── index.ts              (public exports)
├── examples/                 (usage examples for backend + Next.js frontend)
├── postman_collection.json   (import directly into Postman)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 10. Notes / Production Considerations

- Set `synchronize: false` in TypeORM for production; use migrations instead.
- Rotate `jwtSecret` via environment variables, never hardcode it.
- Consider rate-limiting `/auth/login` and `/auth/resend-otp` at the infra level (e.g. with `@nestjs/throttler`) in addition to the built-in OTP cooldown.
- `forgotPassword` intentionally returns the same generic message whether or not the email exists, to avoid leaking which emails are registered.
