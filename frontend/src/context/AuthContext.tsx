import React, { createContext, useContext, useState, useCallback } from 'react';

export type Role = 'patient' | 'doctor' | 'receptionist' | 'admin';

interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  name: string;
  token: string | null;
  userId: string | null;
}

interface AuthContextType extends AuthState {
  login: (role: Role, name: string, token: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'medisync_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null, name: '', token: null, userId: null };
  });

  const login = useCallback((role: Role, name: string, token: string, userId: string) => {
    const newState = { isLoggedIn: true, role, name, token, userId };
    setAuth(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, name: '', token: null, userId: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function roleHomePath(role: Role): string {
  switch (role) {
    case 'patient':       return '/dashboard';
    case 'doctor':        return '/doctors';
    case 'receptionist':  return '/reception';
    case 'admin':         return '/admin';
    default:              return '/';
  }
}
