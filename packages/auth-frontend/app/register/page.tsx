'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Field, Button, Alert, Eyebrow } from '@/components/ui';
import { authApi, ApiError } from '@/lib/api';
import { session } from '@/lib/session';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(email, password);
      session.setPendingEmail(email);
      router.push('/verify-email');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      step={1}
      eyebrow="NEW ACCOUNT"
      title="Set the first tumbler."
      subtitle="Register with an email and password. We'll send a verification code to unlock the next step."
      footer={
        <>
          Already registered?{' '}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <Eyebrow>Step 01 — Register</Eyebrow>
      <h2 className="mb-6 font-display text-2xl text-ink">Create your account</h2>

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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <div className="mt-2">
          <Button type="submit" loading={loading}>
            Send verification code
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
