import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api.js';
import localAdapter from '../services/localAdapter.js';
import useToast from '../hooks/useToast.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const useLocal = import.meta.env.VITE_USE_LOCAL === '1';
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nova_token'));
  const [authLoading, setAuthLoading] = useState(true);

  const handleAuth = useCallback((payload) => {
    const nextToken = payload.token;
    setToken(nextToken);
    if (!useLocal) {
      setAuthToken(nextToken);
    } else {
      localStorage.setItem('nova_token', nextToken);
    }
    setUser(payload.user);
  }, [useLocal]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
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
    } catch (error) {
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
    async (credentials) => {
      setAuthLoading(true);
      try {
        const payload = useLocal
          ? await localAdapter.loginUser(credentials)
          : (await api.post('/auth/login', credentials)).data;
        handleAuth(payload);
        addToast('Welcome back, commander.', 'success');
        return true;
      } catch (error) {
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
    async (payload) => {
      setAuthLoading(true);
      try {
        const data = useLocal
          ? await localAdapter.registerUser(payload)
          : (await api.post('/auth/register', payload)).data;
        handleAuth(data);
        addToast('Account created. Sync engaged.', 'success');
        return true;
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Registration failed';
        addToast(message, 'error');
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [addToast, handleAuth, useLocal]
  );

  const value = useMemo(
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
