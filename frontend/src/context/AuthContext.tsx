import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken, setRefreshToken } from '../services/api';
import localAdapter from '../services/localAdapter';
import { registerPushIfAvailable } from '../services/push';
import useToast from '../hooks/useToast';

type AuthUser = {
  id?: string;
  _id?: string;
  username: string;
  createdAt?: string;
};

type AuthPayload = {
  user: AuthUser;
  token: string;
  refreshToken?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  register: (payload: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { addToast } = useToast();
  const useLocal = import.meta.env.VITE_USE_LOCAL === '1';
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nova_token'));
  const [authLoading, setAuthLoading] = useState(true);

  const handleAuth = useCallback(
    (payload: AuthPayload) => {
      const nextToken = payload.token;
      setToken(nextToken);
      if (!useLocal) {
        setAuthToken(nextToken);
        setRefreshToken(payload.refreshToken || null);
      } else {
        localStorage.setItem('nova_token', nextToken);
      }
      setUser(payload.user);

      if (!useLocal) {
        registerPushIfAvailable().catch(() => null);
      }
    },
    [useLocal]
  );

  const logout = useCallback(() => {
    if (!useLocal) {
      const refreshToken = localStorage.getItem('nova_refresh_token');
      if (refreshToken) {
        api.post('/auth/logout', { refreshToken }).catch(() => null);
      }
    }

    setUser(null);
    setToken(null);
    setAuthToken(null);
    setRefreshToken(null);
    if (useLocal) {
      localAdapter.logoutUser();
    }
    addToast('Signed out', 'info');
  }, [addToast, useLocal]);

  const fetchMe = useCallback(async () => {
    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      if (useLocal) {
        const { user: me } = await localAdapter.getMe();
        setUser(me);
      } else {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      }
    } catch (_error) {
      logout();
    } finally {
      setAuthLoading(false);
    }
  }, [logout, token, useLocal]);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
    fetchMe();
  }, [fetchMe, token]);

  const login = useCallback(
    async (credentials: { username: string; password: string }) => {
      setAuthLoading(true);
      try {
        const payload = useLocal
          ? await localAdapter.loginUser(credentials)
          : (await api.post('/auth/login', credentials)).data;
        handleAuth(payload);
        addToast('Welcome back, commander.', 'success');
        return true;
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Login failed';
        addToast(message, 'error');
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [addToast, handleAuth, useLocal]
  );

  const register = useCallback(
    async (payload: { username: string; password: string }) => {
      setAuthLoading(true);
      try {
        const data = useLocal
          ? await localAdapter.registerUser(payload)
          : (await api.post('/auth/register', payload)).data;
        handleAuth(data);
        addToast('Account created. Sync engaged.', 'success');
        return true;
      } catch (error: any) {
        const message = error?.response?.data?.message || error?.message || 'Registration failed';
        addToast(message, 'error');
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [addToast, handleAuth, useLocal]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      authLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser: fetchMe,
    }),
    [authLoading, fetchMe, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);
