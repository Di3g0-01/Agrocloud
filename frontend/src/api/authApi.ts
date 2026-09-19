import { axiosClient } from './axiosClient';
import type { AuthResponse, UserRole } from '../types';

export const loginApi = async (email: string, pass: string): Promise<AuthResponse> => {
  try {
    const res = await axiosClient.post('/auth/login', { email, password: pass });
    return res.data?.data || res.data;
  } catch {
    console.warn('API Backend no conectada. Simulando login...');
    let role: UserRole = 'CLIENTE';
    let name = 'Diego Ovalle';
    let empresa = 'Finca Los Pinos';

    if (email.includes('admin')) {
      role = 'ADMIN';
      name = 'Administrador Sistema';
      empresa = 'AgroCloud Platform';
    } else if (email.includes('soporte')) {
      role = 'SOPORTE';
      name = 'Técnico de Soporte';
      empresa = 'AgroCloud Support';
    }

    const mockResponse: AuthResponse = {
      token: 'jwt-mock-token-' + Date.now(),
      user: {
        id: 'usr-' + Math.floor(Math.random() * 1000),
        nombre: name,
        email,
        rol: role,
        empresa,
        estado: 'ACTIVO',
      },
    };
    return mockResponse;
  }
};

export const registerApi = async (data: { nombre: string; email: string; password: string; empresa?: string }): Promise<AuthResponse> => {
  try {
    const res = await axiosClient.post('/auth/register', data);
    return res.data?.data || res.data;
  } catch {
    console.warn('API Backend no conectada. Simulando registro...');
    return {
      token: 'jwt-mock-token-reg-' + Date.now(),
      user: {
        id: 'usr-' + Date.now(),
        nombre: data.nombre,
        email: data.email,
        rol: 'CLIENTE',
        empresa: data.empresa || 'Finca Agrícola',
        estado: 'ACTIVO',
      },
    };
  }
};
