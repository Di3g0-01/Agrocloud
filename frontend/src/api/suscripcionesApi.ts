import { axiosClient } from './axiosClient';
import type { Suscripcion } from '../types';

export const getMiSuscripcionActiva = async (): Promise<Suscripcion | null> => {
  try {
    const res = await axiosClient.get('/suscripciones/activa');
    return res.data?.data || res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const getMisSuscripciones = async (): Promise<Suscripcion[]> => {
  const res = await axiosClient.get('/suscripciones/me');
  return res.data?.data || res.data;
};

export const contratarPlan = async (planId: string, planNombre?: string, monto?: number): Promise<Suscripcion> => {
  void planNombre; void monto;
  const res = await axiosClient.post('/suscripciones', { planId });
  return res.data?.data || res.data;
};

export const getTodasSuscripciones = async (): Promise<Suscripcion[]> => (await axiosClient.get('/suscripciones')).data;
export const actualizarEstadoSuscripcion = async (id: string, status: Suscripcion['estado']): Promise<Suscripcion> =>
  (await axiosClient.patch(`/suscripciones/${id}/status`, null, { params: { status } })).data;

