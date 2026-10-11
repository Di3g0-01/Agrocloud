import { axiosClient } from './axiosClient';
import type { PlantillaAdmin } from '../types/admin';

export const getPlantillas = async (): Promise<PlantillaAdmin[]> => {
  const res = await axiosClient.get('/plantillas');
  return res.data?.data || res.data;
};

export const crearPlantillaApi = async (data: {
  nombre: string;
  descripcion: string;
  version?: string;
  estado?: string;
  schema?: string[];
}): Promise<PlantillaAdmin> => {
  const res = await axiosClient.post('/plantillas', data);
  return res.data?.data || res.data;
};

export const eliminarPlantillaApi = async (id: string): Promise<boolean> => {
  await axiosClient.delete(`/plantillas/${id}`);
  return true;
};

export const actualizarPlantillaApi = async (id: string, data: {
  nombre: string; descripcion: string; version: string; estado: string; schema: string[];
}): Promise<PlantillaAdmin> => {
  const res = await axiosClient.put(`/plantillas/${id}`, data);
  return res.data?.data || res.data;
};
