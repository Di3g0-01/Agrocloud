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

export interface MessageResponse { message: string }

export async function registerApi(data: RegistrationInput): Promise<MessageResponse> {
  const response = await axiosClient.post<MessageResponse>('/auth/register', data);
  return response.data;
}

export async function verifyEmailApi(token: string): Promise<AuthResponse> {
  return toFrontendResponse((await axiosClient.post<ApiAuthResponse>('/auth/verify-email', { token })).data);
}

export async function resendVerificationApi(email: string): Promise<MessageResponse> {
  return (await axiosClient.post<MessageResponse>('/auth/resend-verification', { email })).data;
}

export async function forgotPasswordApi(email: string): Promise<MessageResponse> {
  return (await axiosClient.post<MessageResponse>('/auth/forgot-password', { email })).data;
}

export async function resetPasswordApi(token: string, password: string): Promise<MessageResponse> {
  return (await axiosClient.post<MessageResponse>('/auth/reset-password', { token, password })).data;
}

export interface EmailLink { action: 'verify' | 'reset'; token: string }

export function readEmailLink(): EmailLink | null {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.has('verify-email')) return { action: 'verify', token: params.get('verify-email') || '' };
  if (params.has('reset-password')) return { action: 'reset', token: params.get('reset-password') || '' };
  return null;
}

export async function currentUserApi(): Promise<AuthResponse['user']> {
  const response = await axiosClient.get<ApiUser>('/auth/me');
  return toFrontendUser(response.data);
}
