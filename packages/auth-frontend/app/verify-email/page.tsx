'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Button, Alert, Eyebrow } from '@/components/ui';
import { OtpInput } from '@/components/OtpInput';
import { authApi, ApiError } from '@/lib/api';
import { session } from '@/lib/session';

const COOLDOWN = 60;

export default function VerifyEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(session.getPendingEmail());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail(email, otp);
      router.push('/login?verified=1');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      await authApi.resendOtp(email, 'EMAIL_VERIFY');
      setSuccess('A fresh code is on its way — check the server console if testing locally.');
      setCooldown(COOLDOWN);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      step={2}
      eyebrow="CONFIRM IT'S YOU"
      title="Second tumbler: the code."
      subtitle="Enter the 6-digit code sent to your email. In local development, it also prints straight to the backend terminal."
    >
      <Eyebrow>Step 02 — Verify</Eyebrow>
      <h2 className="mb-1 font-display text-2xl text-ink">Enter your code</h2>
      <p className="mb-6 font-body text-sm text-ink-soft">
        Sent to <span className="font-medium text-ink">{email || 'your email'}</span>
      </p>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <OtpInput value={otp} onChange={setOtp} />
        <Button type="submit" loading={loading} disabled={otp.length < 6}>
          Verify email
        </Button>
      </form>

      <button
        onClick={handleResend}
        disabled={resending || cooldown > 0}
        className="mt-5 w-full text-center font-mono text-xs tracking-wide text-ink-soft underline underline-offset-2 transition hover:text-ink disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
      >
        {cooldown > 0 ? `Resend available in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
      </button>
    </AuthShell>
  );
}
