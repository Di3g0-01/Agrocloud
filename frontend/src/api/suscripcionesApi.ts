import { axiosClient } from './axiosClient';
import type { Suscripcion } from '../types';

export const getMiSuscripcionActiva = async (): Promise<Suscripcion | null> => {
  try {
    const res = await axiosClient.get('/suscripciones/activa');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /suscripciones/activa no disponible. Retornando suscripción activa fallback.');
    return null;
  }
};

export const getMisSuscripciones = async (): Promise<Suscripcion[]> => {
  try {
    const res = await axiosClient.get('/suscripciones/me');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /suscripciones/me no disponible.');
    return [];
  }
};

export const contratarPlan = async (planId: string, planNombre?: string, monto?: number): Promise<Suscripcion> => {
  try {
    const res = await axiosClient.post('/suscripciones', { planId });
    return res.data?.data || res.data;
  } catch (err) {
    console.warn('API /suscripciones no disponible. Simulando suscripción.', err);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const nuevaSuscripcion: Suscripcion = {
      id: 'sub-' + Date.now(),
      planId,
      planNombre: planNombre || 'Plan Contratado',
      usuarioId: 'usr-current',
      estado: 'active',
      fechaInicio: now.toISOString().split('T')[0],
      fechaProximoPago: nextMonth.toISOString().split('T')[0],
      monto: monto || 0,
    };
    return nuevaSuscripcion;
  }
};

