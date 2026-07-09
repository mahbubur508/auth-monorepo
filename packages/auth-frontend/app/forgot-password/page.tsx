'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Field, Button, Alert, Eyebrow } from '@/components/ui';
import { authApi, ApiError } from '@/lib/api';
import { session } from '@/lib/session';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      session.setResetEmail(email);
      router.push('/reset-password');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      step={4}
      eyebrow="LOST THE COMBINATION"
      title="Fourth tumbler: recover."
      subtitle="Enter the email on your account. If it exists, we'll send a code you can use to set a new password."
      footer={
        <>
          Remembered it after all?{' '}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <Eyebrow>Step 04 — Recover</Eyebrow>
      <h2 className="mb-6 font-display text-2xl text-ink">Reset your password</h2>

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
        <div className="mt-2">
          <Button type="submit" loading={loading}>
            Send reset code
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
