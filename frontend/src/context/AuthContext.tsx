import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { loginApi, registerApi } from '../api/authApi';
import type { MessageResponse } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserRole>;
  register: (name: string, email: string, pass: string, company?: string) => Promise<MessageResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const syncState = () => {
      const savedToken = localStorage.getItem('agrocloud_token');
      const savedUser = localStorage.getItem('agrocloud_user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error al restaurar sesión guardada:', e);
          localStorage.removeItem('agrocloud_token');
          localStorage.removeItem('agrocloud_user');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    };

    syncState();
    window.addEventListener('storage', syncState);
    window.addEventListener('agrocloud:auth-change', syncState);
    return () => {
      window.removeEventListener('storage', syncState);
      window.removeEventListener('agrocloud:auth-change', syncState);
    };
  }, []);

  const login = async (email: string, pass: string): Promise<UserRole> => {
    const res = await loginApi(email, pass);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('agrocloud_token', res.token);
    localStorage.setItem('agrocloud_user', JSON.stringify(res.user));
    return res.user.rol;
  };

  const register = async (fullName: string, email: string, pass: string, companyName?: string): Promise<MessageResponse> => {
    return registerApi({
      organizationName: companyName?.trim() || fullName.trim(),
      contactName: fullName.trim(),
      email,
      password: pass,
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrocloud_token');
    localStorage.removeItem('agrocloud_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('agrocloud_token') : null;
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('agrocloud_user') : null;
    let parsedUser: User | null = null;
    if (savedUser) {
      try {
        parsedUser = JSON.parse(savedUser);
      } catch {
        parsedUser = null;
      }
    }
    return {
      user: parsedUser,
      token: savedToken,
      isAuthenticated: Boolean(parsedUser && savedToken),
      isLoading: false,
      login: async () => 'CLIENTE' as UserRole,
      register: async () => { throw new Error('El proveedor de autenticación no está disponible.'); },
      logout: () => {
        localStorage.removeItem('agrocloud_token');
        localStorage.removeItem('agrocloud_user');
      },
    };
  }
  return context;
};
