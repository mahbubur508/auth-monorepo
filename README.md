# auth-monorepo

This repo has **three packages**:

| Folder                      | What it is                                       | Has a `start`/`dev` script? |
|------------------------------|---------------------------------------------------|------------------------------|
| `packages/nest-auth`          | The reusable auth **library** (publish this to npm) | ❌ No — it's a library        |
| `packages/auth-demo-app`      | A working NestJS **server** that uses the library  | ✅ Yes — the backend API      |
| `packages/auth-frontend`      | A polished Next.js **UI** for the whole auth flow  | ✅ Yes — the frontend         |

## Installation (For external projects)

If you want to use this library in an external NestJS project, install it via npm:

```bash
npm install @mahbub508/nest-auth
```

## Quick Start (run everything)

You need **two terminals** — one for the API, one for the UI.

**Terminal 1 — backend (http://localhost:3000)**
```bash
npm install
npm run start:demo
```

**Terminal 2 — frontend (http://localhost:3001)**
```bash
npm run start:frontend
```

Open **http://localhost:3001** in your browser. You'll land on the Keystone landing page —
click "Create an account" and walk through the full flow: register → verify email (OTP) →
sign in → forgot/reset password. Every OTP also prints to the backend terminal, so you don't
need a real email provider to try it end to end.

## Testing the API directly (Postman)

Import `packages/nest-auth/postman_collection.json` into Postman if you want to hit the
endpoints directly instead of (or alongside) the UI.

## Publishing the library

```bash
cd packages/nest-auth
npm run build
npm login
npm publish --access public
```

See `packages/nest-auth/README.md` for full details, configuration options, and how to
wire the library into your own (non-demo) NestJS project.

## About the frontend design

`packages/auth-frontend` uses a "vault" visual theme — a dark control-panel side with a
rotating dial that tracks which of the 4 real auth steps (Register → Verify → Access →
Recover) you're on, paired with a warm ivory form card. It's built with Next.js App Router,
TypeScript, and Tailwind — no component library, so it's easy to restyle. See
`packages/auth-frontend/README.md` for the full design token breakdown.
