// examples/nextjs-usage/useAuth.ts
// Copy this into your Next.js app (or publish as a separate @yourscope/next-auth-ui package)

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // e.g. https://api.myapp.com

export function useAuth() {
  const register = (email: string, password: string) =>
    axios.post(`${API_BASE_URL}/auth/register`, { email, password });

  const verifyEmail = (email: string, otp: string) =>
    axios.post(`${API_BASE_URL}/auth/verify-email`, { email, otp });

  const resendOtp = (email: string, type: 'EMAIL_VERIFY' | 'RESET_PASSWORD') =>
    axios.post(`${API_BASE_URL}/auth/resend-otp`, { email, type });

  const login = (email: string, password: string) =>
    axios.post(`${API_BASE_URL}/auth/login`, { email, password });

  const forgotPassword = (email: string) =>
    axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });

  const resetPassword = (email: string, otp: string, newPassword: string) =>
    axios.post(`${API_BASE_URL}/auth/reset-password`, { email, otp, newPassword });

  return { register, verifyEmail, resendOtp, login, forgotPassword, resetPassword };
}

/*
Usage inside a Next.js page/component:

'use client';
import { useAuth } from './useAuth';

export default function LoginPage() {
  const { login } = useAuth();

  async function handleLogin(email: string, password: string) {
    try {
      const res = await login(email, password);
      localStorage.setItem('accessToken', res.data.accessToken);
    } catch (err) {
      console.error(err.response?.data?.message);
    }
  }

  return (...)
}
*/
