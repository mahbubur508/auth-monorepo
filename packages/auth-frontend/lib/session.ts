const PENDING_EMAIL_KEY = 'keystone.pendingEmail';
const RESET_EMAIL_KEY = 'keystone.resetEmail';
const TOKEN_KEY = 'keystone.token';
const USER_EMAIL_KEY = 'keystone.userEmail';

export const session = {
  setPendingEmail: (email: string) => sessionStorage.setItem(PENDING_EMAIL_KEY, email),
  getPendingEmail: () => (typeof window === 'undefined' ? '' : sessionStorage.getItem(PENDING_EMAIL_KEY) || ''),

  setResetEmail: (email: string) => sessionStorage.setItem(RESET_EMAIL_KEY, email),
  getResetEmail: () => (typeof window === 'undefined' ? '' : sessionStorage.getItem(RESET_EMAIL_KEY) || ''),

  setToken: (token: string, email: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_EMAIL_KEY, email);
  },
  getToken: () => (typeof window === 'undefined' ? '' : localStorage.getItem(TOKEN_KEY) || ''),
  getUserEmail: () => (typeof window === 'undefined' ? '' : localStorage.getItem(USER_EMAIL_KEY) || ''),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
  },
};
