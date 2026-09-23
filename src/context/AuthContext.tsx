import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types.ts';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string, role?: Role) => Promise<User>;
  logout: () => void;
  quickDemoLogin: (role: Role) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const stored = getStoredToken();
      if (!stored) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        removeStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (username: string, password: string, role?: Role) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password, role);
      setStoredToken(res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (role: Role) => {
    let username = 'admin';
    let password = 'admin123';
    if (role === 'TEACHER') {
      username = 'teacher';
      password = 'teacher123';
    } else if (role === 'STUDENT') {
      username = 'student';
      password = 'student123';
    }
    return login(username, password, role);
  };

  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, quickDemoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
