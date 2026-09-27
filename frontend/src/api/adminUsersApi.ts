import axios from 'axios';
import { axiosClient } from './axiosClient';

export type ApiRole = 'ADMINISTRADOR' | 'CLIENTE' | 'SOPORTE';
export type ApiStatus = 'ACTIVO' | 'PENDIENTE' | 'SUSPENDIDO';
export interface AdminUser {
  id: string; organizationName: string; contactName: string | null; email: string;
  phone: string | null; role: ApiRole; status: ApiStatus; createdAt: string;
}
export interface CreateAdminUser {
  organizationName: string; contactName: string; email: string; phone: string; password: string; role: ApiRole;
}
export type UpdateAdminUser = Omit<CreateAdminUser, 'password'> & { password?: string; status: ApiStatus };

export const listAdminUsers = async () => (await axiosClient.get<AdminUser[]>('/usuarios')).data;
export const getAdminUser = async (id: string) => (await axiosClient.get<AdminUser>(`/usuarios/${id}`)).data;
export const createAdminUser = async (data: CreateAdminUser) => (await axiosClient.post<AdminUser>('/usuarios', data)).data;
export const updateAdminUser = async (id: string, data: UpdateAdminUser) => (await axiosClient.put<AdminUser>(`/usuarios/${id}`, data)).data;
export function adminUserError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string; fieldErrors?: Record<string, string> } | undefined;
    return Object.values(body?.fieldErrors || {})[0] || body?.message || 'No se pudo completar la operación.';
  }
  return 'No se pudo completar la operación.';
}
