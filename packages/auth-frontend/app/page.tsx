import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-vault">
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-[0.08] blur-3xl"
        style={{ background: 'radial-gradient(circle, #E3C077 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full opacity-[0.06] blur-3xl"
        style={{ background: 'radial-gradient(circle, #C99A46 0%, transparent 70%)' }}
      />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 lg:px-8">
        <header className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brass" />
          <span className="font-display text-lg text-ivory">Keystone</span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-16">
          <p className="font-mono text-xs tracking-widest2 text-brass">
            01 REGISTER · 02 VERIFY · 03 ACCESS · 04 RECOVER
          </p>
          <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[1.05] text-ivory lg:text-7xl">
            Every account
            <br />
            starts with a
            <br />
            <span className="text-brass">turn of the dial.</span>
          </h1>
          <p className="mt-6 max-w-md font-body text-base leading-relaxed text-ivory/60">
            A complete, working demo of the Keystone auth system — register, verify by
            code, sign in, and recover access. Four steps, one dial, zero guesswork.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-brass px-6 py-3 font-body text-sm font-medium text-vault-deep transition hover:bg-brass-light"
            >
              Create an account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-ivory/15 px-6 py-3 font-body text-sm font-medium text-ivory transition hover:border-ivory/30"
            >
              I already have one
            </Link>
          </div>
        </section>

        <footer className="flex flex-col gap-1 border-t border-vault-line py-6 font-mono text-[11px] text-ivory/30 sm:flex-row sm:items-center sm:justify-between">
          <span>Backed by @mahbub508/nest-auth</span>
          <span>localhost:3000 → API · localhost:3001 → this app</span>
        </footer>
      </div>
    </main>
  );
}
