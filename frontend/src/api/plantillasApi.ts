import { axiosClient } from './axiosClient';
import type { PlantillaAdmin } from '../types/admin';

export const getPlantillas = async (): Promise<PlantillaAdmin[]> => {
  try {
    const res = await axiosClient.get('/plantillas');
    return res.data?.data || res.data;
  } catch (err) {
    console.warn('API /plantillas no disponible.', err);
    return [];
  }
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
  try {
    await axiosClient.delete(`/plantillas/${id}`);
    return true;
  } catch (err) {
    console.warn(`Error al eliminar plantilla ${id}`, err);
    return false;
  }
};
