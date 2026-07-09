'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/AuthShell';
import { Field, Button, Alert, Eyebrow } from '@/components/ui';
import { OtpInput } from '@/components/OtpInput';
import { authApi, ApiError } from '@/lib/api';
import { session } from '@/lib/session';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setEmail(session.getResetEmail());
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
      await authApi.resetPassword(email, otp, newPassword);
      router.push('/login?reset=1');
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
      await authApi.resendOtp(email, 'RESET_PASSWORD');
      setSuccess('A fresh code is on its way — check the server console if testing locally.');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      step={4}
      eyebrow="NEW COMBINATION"
      title="Set a new password."
      subtitle="Enter the code we sent, then choose a new password to finish recovering your account."
    >
      <Eyebrow>Step 04 — Recover</Eyebrow>
      <h2 className="mb-1 font-display text-2xl text-ink">Reset password</h2>
      <p className="mb-6 font-body text-sm text-ink-soft">
        Code sent to <span className="font-medium text-ink">{email || 'your email'}</span>
      </p>

      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <OtpInput value={otp} onChange={setOtp} />
        <Field
          label="NEW PASSWORD"
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
        />
        <Button type="submit" loading={loading} disabled={otp.length < 6}>
          Reset password
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
