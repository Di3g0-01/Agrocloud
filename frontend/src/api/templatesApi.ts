import { axiosClient } from './axiosClient';
import type { AdminTemplate } from '../types/admin';

export const getTemplates = async (): Promise<AdminTemplate[]> => {
  const res = await axiosClient.get('/plantillas');
  return res.data?.data || res.data;
};

export const createTemplateApi = async (data: {
  nombre: string;
  descripcion: string;
  version?: string;
  estado?: string;
  schema?: string[];
}): Promise<AdminTemplate> => {
  const res = await axiosClient.post('/plantillas', data);
  return res.data?.data || res.data;
};

export const deleteTemplateApi = async (id: string): Promise<boolean> => {
  await axiosClient.delete(`/plantillas/${id}`);
  return true;
};

export const updateTemplateApi = async (id: string, data: {
  nombre: string; descripcion: string; version: string; estado: string; schema: string[];
}): Promise<AdminTemplate> => {
  const res = await axiosClient.put(`/plantillas/${id}`, data);
  return res.data?.data || res.data;
};
