import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { loginApi, registerApi } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserRole>;
  register: (nombre: string, email: string, pass: string, empresa?: string) => Promise<UserRole>;
  logout: () => void;
  setSimulatedRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
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
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<UserRole> => {
    const res = await loginApi(email, pass);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('agrocloud_token', res.token);
    localStorage.setItem('agrocloud_user', JSON.stringify(res.user));
    return res.user.rol;
  };

  const register = async (nombre: string, email: string, pass: string, empresa?: string): Promise<UserRole> => {
    const res = await registerApi({ nombre, email, password: pass, empresa });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('agrocloud_token', res.token);
    localStorage.setItem('agrocloud_user', JSON.stringify(res.user));
    return res.user.rol;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrocloud_token');
    localStorage.removeItem('agrocloud_user');
  };

  const setSimulatedRole = (role: UserRole) => {
    if (!user) {
      const mockUser: User = {
        id: 'usr-simulated',
        nombre: role === 'ADMIN' ? 'Admin Diego' : role === 'SOPORTE' ? 'Soporte Técnico' : 'Diego Ovalle',
        email: `${role.toLowerCase()}@agrocloud.gt`,
        rol: role,
        empresa: 'Finca Los Pinos',
        estado: 'ACTIVO',
      };
      setUser(mockUser);
      setToken('mock-jwt-token');
      localStorage.setItem('agrocloud_token', 'mock-jwt-token');
      localStorage.setItem('agrocloud_user', JSON.stringify(mockUser));
    } else {
      const updatedUser = { ...user, rol: role };
      setUser(updatedUser);
      localStorage.setItem('agrocloud_user', JSON.stringify(updatedUser));
    }
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
        setSimulatedRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
