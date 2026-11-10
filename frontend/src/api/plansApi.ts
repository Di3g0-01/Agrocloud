import { axiosClient } from './axiosClient';
import type { Plan } from '../types';

export const getPlans = async (): Promise<Plan[]> => {
  const res = await axiosClient.get('/planes');
  return res.data?.data || res.data;
};

export type PlanInput = Pick<Plan, 'nombre' | 'almacenamientoGb' | 'precioMensual' | 'descripcion' | 'instanciasPermitidas' | 'popular' | 'activo'>;
export const createPlan = async (data: PlanInput): Promise<Plan> => (await axiosClient.post('/planes', data)).data;
export const updatePlan = async (id: string, data: PlanInput): Promise<Plan> => (await axiosClient.put(`/planes/${id}`, data)).data;
export const deletePlan = async (id: string): Promise<void> => { await axiosClient.delete(`/planes/${id}`); };

export type ComplementoEnum = 'ALMACENAMIENTO_EXTRA' | 'INSTANCIA_EXTRA' | 'RESPALDO_DIARIO' | 'SOPORTE_PRIORITARIO';

export interface CotizacionPlan {
  planId: string;
  descripcion: string;
  precioMensual: number;
  almacenamientoGb: number;
  instanciasPermitidas: number;
  complementos: string[];
}

export const cotizarPlan = async (
  planId: string,
  complementos: ComplementoEnum[]
): Promise<CotizacionPlan> => {
  const res = await axiosClient.post(`/planes/${planId}/cotizar`, { complementos });
  return res.data?.data || res.data;
};
