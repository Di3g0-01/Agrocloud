import { axiosClient } from './axiosClient';
import type { AuthResponse, User, UserRole } from '../types';

interface ApiUser {
  id: string;
  organizationName: string;
  contactName: string | null;
  email: string;
  phone: string | null;
  role: 'ADMINISTRADOR' | 'CLIENTE' | 'SOPORTE';
  status: 'ACTIVO' | 'PENDIENTE' | 'SUSPENDIDO';
}

interface ApiAuthResponse {
  token: string;
  user: ApiUser;
}

export interface RegistrationInput {
  organizationName: string;
  contactName?: string;
  email: string;
  phone?: string;
  password: string;
}

function toFrontendUser(apiUser: ApiUser): User {
  if (!apiUser?.id || !apiUser.organizationName || !apiUser.role) {
    throw new Error('Los datos de la cuenta están incompletos.');
  }
  const roles: Record<ApiUser['role'], UserRole> = {
    ADMINISTRADOR: 'ADMIN',
    CLIENTE: 'CLIENTE',
    SOPORTE: 'SOPORTE',
  };
  const role = roles[apiUser.role];
  if (!role) {
    throw new Error('El servidor devolvió un rol desconocido.');
  }

  return {
    id: apiUser.id,
    nombre: apiUser.contactName || apiUser.organizationName,
    email: apiUser.email,
    rol: role,
    empresa: apiUser.organizationName,
    telefono: apiUser.phone || undefined,
    estado: apiUser.status === 'PENDIENTE' ? 'INACTIVO' : apiUser.status,
  };
}

function toFrontendResponse(response: ApiAuthResponse): AuthResponse {
  if (!response?.token) {
    throw new Error('La respuesta de autenticación está incompleta.');
  }
  return { token: response.token, user: toFrontendUser(response.user) };
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const response = await axiosClient.post<ApiAuthResponse>('/auth/login', { email, password });
  return toFrontendResponse(response.data);
}

export async function registerApi(data: RegistrationInput): Promise<AuthResponse> {
  const response = await axiosClient.post<ApiAuthResponse>('/auth/register', data);
  const result = toFrontendResponse(response.data);
  if (result.user.rol !== 'CLIENTE') {
    throw new Error('El registro público solo admite cuentas de cliente.');
  }
  return result;
}

export async function currentUserApi(): Promise<AuthResponse['user']> {
  const response = await axiosClient.get<ApiUser>('/auth/me');
  return toFrontendUser(response.data);
}
