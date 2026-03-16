import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({ token: null, user: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('auth').then(d => {
      if (d) { const p = JSON.parse(d); setToken(p.token); setUser(p.user); }
    });
  }, []);

  const login = (t: string, u: any) => {
    setToken(t); setUser(u);
    AsyncStorage.setItem('auth', JSON.stringify({ token: t, user: u }));
  };
  const logout = () => {
    setToken(null); setUser(null);
    AsyncStorage.removeItem('auth');
  };

  return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
