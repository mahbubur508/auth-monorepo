# auth-frontend — Keystone

A Next.js (App Router + TypeScript + Tailwind) frontend for the `@mahbub508/nest-auth`
backend. No component library — plain Tailwind, so it's easy to reskin.

## Run it

```bash
npm install
npm run dev
```

Runs on **http://localhost:3001** (so it doesn't collide with the backend on :3000).
Set `NEXT_PUBLIC_API_URL` in `.env.local` if your backend runs elsewhere.

## Pages

| Route               | Purpose                                  |
|---------------------|-------------------------------------------|
| `/`                  | Landing page / hero                       |
| `/register`          | Create account                            |
| `/verify-email`      | Enter OTP sent after registering          |
| `/login`             | Sign in                                   |
| `/forgot-password`   | Request a password reset code             |
| `/reset-password`    | Enter code + set new password             |
| `/dashboard`         | Post-login screen (decodes & shows the JWT) |

## Design system

**Theme:** a vault / security-terminal concept. The 4 real steps of the auth flow
(Register → Verify → Access → Recover) are represented literally as a rotating dial and a
numbered stepper on the dark left panel — the numbering is meaningful here since the steps
are a genuine sequence, not decoration.

**Palette**
| Token | Hex | Use |
|---|---|---|
| `vault` | `#11141A` | Primary dark background |
| `vault-deep` | `#0B0D11` | Recessed/inset panels |
| `vault-panel` | `#171B22` | Cards on dark background |
| `brass` | `#C99A46` | Primary accent |
| `brass-light` | `#E3C077` | Hover / highlight accent |
| `ivory` | `#FAF6EC` | Light form-card background |
| `ink` | `#1B1D22` | Text on ivory |
| `sage` / `rust` | `#6E9B7B` / `#C1584A` | Success / error states |

**Type**
- Display: **Space Grotesk** — headlines
- Body: **Inter** — everything readable
- Mono: **JetBrains Mono** — OTP digit boxes, eyebrows/labels, technical details (functional, not decorative — reinforces the "code" theme)

## Structure

```
app/
├── layout.tsx           (fonts + global shell)
├── page.tsx             (landing hero)
├── register/page.tsx
├── verify-email/page.tsx
├── login/page.tsx
├── forgot-password/page.tsx
├── reset-password/page.tsx
└── dashboard/page.tsx
components/
├── AuthShell.tsx        (split-panel layout + the dial)
├── OtpInput.tsx          (6-box code input)
└── ui.tsx                (Field, Button, Alert, Eyebrow primitives)
lib/
├── api.ts                (fetch wrapper for the backend)
└── session.ts             (email hand-off + JWT storage helpers)
```

## Notes

- Uses `sessionStorage` to pass the email between register→verify and forgot→reset steps,
  and `localStorage` for the JWT after login. This is a plain Next.js app (not a Claude
  artifact), so normal browser storage APIs are fine here.
- `next/font/google` downloads and self-hosts fonts at build time — no client-side calls to
  Google happen at runtime, but the very first `npm run build`/`npm run dev` does need
  internet access once to fetch them.
