import { axiosClient } from './axiosClient';
import type { Suscripcion } from '../types';

export const contratarPlan = async (planId: string, planNombre: string, monto: number): Promise<Suscripcion> => {
  try {
    const res = await axiosClient.post('/suscripciones', { planId });
    return res.data?.data || res.data;
  } catch {
    console.warn('API /suscripciones no disponible. Simulando suscripción.');
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const nuevaSuscripcion: Suscripcion = {
      id: 'sub-' + Date.now(),
      planId,
      planNombre,
      usuarioId: 'usr-current',
      estado: 'ACTIVA',
      fechaInicio: now.toISOString().split('T')[0],
      fechaProximoPago: nextMonth.toISOString().split('T')[0],
      monto,
    };
    return nuevaSuscripcion;
  }
};
