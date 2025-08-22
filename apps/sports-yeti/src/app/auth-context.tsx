import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { apiFetch } from './api';

interface AuthState {
  token: string | null;
  leagueId: string | null;
  user: any | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLeagueId: (leagueId: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ access_token: string }>(
      '/api/v1/auth/login',
      { method: 'POST', body: { email, password } }
    );
    setToken(res.access_token);
    const me = await apiFetch<any>('/api/v1/auth/me', {}, res.access_token);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, leagueId, login, logout, setLeagueId }),
    [token, user, leagueId, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


