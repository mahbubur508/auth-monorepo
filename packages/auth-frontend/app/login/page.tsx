'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Field, Button, Alert, Eyebrow } from '@/components/ui';
import { authApi, ApiError } from '@/lib/api';
import { session } from '@/lib/session';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justVerified = params.get('verified') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      session.setToken(res.accessToken, res.user.email);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      step={3}
      eyebrow="OPEN THE VAULT"
      title="Third tumbler: access."
      subtitle="Sign in with your verified email and password to reach your account."
      footer={
        <>
          New here?{' '}
          <Link href="/register" className="font-medium text-ink underline underline-offset-2">
            Create an account
          </Link>
        </>
      }
    >
      <Eyebrow>Step 03 — Access</Eyebrow>
      <h2 className="mb-6 font-display text-2xl text-ink">Sign in</h2>

      {justVerified && <Alert kind="success">Email verified. You can sign in now.</Alert>}
      {error && <Alert kind="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="EMAIL"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Field
          label="PASSWORD"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
        <div className="-mt-1 text-right">
          <Link href="/forgot-password" className="font-mono text-xs text-ink-soft underline underline-offset-2 hover:text-ink">
            Forgot password?
          </Link>
        </div>
        <div className="mt-1">
          <Button type="submit" loading={loading}>
            Sign in
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
