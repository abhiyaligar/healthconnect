import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Role = 'patient' | 'doctor' | 'receptionist' | 'admin';

interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  name: string;
}

interface AuthContextType extends AuthState {
  login: (role: Role, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'medisync_auth';

// NOTE: Admin role and permissions are assigned by the backend database.
// In production: POST /api/v1/auth/login → The response JWT contains the authorized role.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ isLoggedIn: false, role: null, name: '' });

  const login = useCallback((role: Role, name: string) => {
    setAuth({ isLoggedIn: true, role, name });
  }, []);

  const logout = useCallback(() => {
    setAuth({ isLoggedIn: false, role: null, name: '' });
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

/** Returns the default home path for a given role */
export function roleHomePath(role: Role): string {
  switch (role) {
    case 'patient':       return '/book';
    case 'doctor':        return '/doctors';
    case 'receptionist':  return '/reception';
    case 'admin':         return '/admin';
  }
}
