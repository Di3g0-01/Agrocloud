import { axiosClient } from './axiosClient';
import type { Incidencia } from '../types';

export const MOCK_INCIDENCIAS: Incidencia[] = [];

export const getIncidencias = async (): Promise<Incidencia[]> => {
  try {
    const res = await axiosClient.get('/incidencias');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /incidencias no disponible. Retornando incidencias Mock.');
    return MOCK_INCIDENCIAS;
  }
};

export const resolverIncidencia = async (id: string): Promise<boolean> => {
  try {
    await axiosClient.patch(`/incidencias/${id}`, { estado: 'RESUELTA' });
    return true;
  } catch {
    console.warn(`Simulando resolución de incidencia ${id}...`);
    return true;
  }
};
