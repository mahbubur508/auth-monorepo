const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_BASE}. Is the backend running?`,
      0,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Something went wrong. Please try again.';
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export type OtpType = 'EMAIL_VERIFY' | 'RESET_PASSWORD';

export const authApi = {
  register: (email: string, password: string) =>
    post<{ success: boolean; message: string }>('/auth/register', { email, password }),

  verifyEmail: (email: string, otp: string) =>
    post<{ success: boolean; message: string }>('/auth/verify-email', { email, otp }),

  resendOtp: (email: string, type: OtpType) =>
    post<{ success: boolean; message: string }>('/auth/resend-otp', { email, type }),

  login: (email: string, password: string) =>
    post<{ success: boolean; accessToken: string; user: { id: string; email: string } }>(
      '/auth/login',
      { email, password },
    ),

  forgotPassword: (email: string) =>
    post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    post<{ success: boolean; message: string }>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    }),
};
