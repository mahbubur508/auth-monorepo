'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { session } from '@/lib/session';

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    const t = session.getToken();
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);
    setEmail(session.getUserEmail());
    setClaims(decodeJwt(t));
  }, [router]);

  function handleLogout() {
    session.clearToken();
    router.push('/login');
  }

  if (!token) return null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-vault px-6">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.08] blur-3xl"
        style={{ background: 'radial-gradient(circle, #E3C077 0%, transparent 70%)' }}
      />

      <div className="animate-rise w-full max-w-lg rounded-2xl border border-vault-line bg-vault-panel p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-brass">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-brass" fill="none">
            <path d="M5 12.5L9.5 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <p className="font-mono text-xs tracking-widest2 text-brass">ALL FOUR TUMBLERS ALIGNED</p>
        <h1 className="mt-3 font-display text-3xl text-ivory">Access granted</h1>
        <p className="mt-2 font-body text-sm text-ivory/60">
          Signed in as <span className="text-ivory">{email}</span>
        </p>

        <div className="mt-8 rounded-lg border border-vault-line bg-vault-deep p-4 text-left">
          <p className="mb-2 font-mono text-[11px] tracking-widest2 text-ivory/40">JWT PAYLOAD</p>
          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-ivory/70">
{JSON.stringify(claims, null, 2)}
          </pre>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full rounded-lg border border-ivory/15 px-4 py-3 font-body text-sm font-medium text-ivory transition hover:border-rust/50 hover:text-rust"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
