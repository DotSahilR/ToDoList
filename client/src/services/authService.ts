import { api, clearStoredToken, getStoredToken, setStoredToken } from './api';
import { AuthPayload, AuthResponse, AuthUser } from '../types/auth';

const USER_KEY = 'todo_auth_user';

const setStoredUser = (user: AuthUser): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const getStoredUser = (): AuthUser | null => {
  const rawValue = localStorage.getItem(USER_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    return null;
  }
};

const clearStoredUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const authService = {
  register: async (payload: AuthPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  login: async (payload: AuthPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    setStoredToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  logout: (): void => {
    clearStoredToken();
    clearStoredUser();
  },

  isAuthenticated: (): boolean => {
    return Boolean(getStoredToken());
  },

  getUser: (): AuthUser | null => {
    return getStoredUser();
  },
};
