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

export type ComplementoEnum =
  | 'ALMACENAMIENTO_EXTRA'
  | 'INSTANCIA_EXTRA'
  | 'RESPALDO_DIARIO'
  | 'SOPORTE_PRIORITARIO'
  | 'EXTRA_STORAGE'
  | 'EXTRA_INSTANCE'
  | 'DAILY_BACKUP'
  | 'PRIORITY_SUPPORT';

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
  const normalizedComplementos = (complementos || []).map((c) => {
    switch (c) {
      case 'EXTRA_STORAGE': return 'ALMACENAMIENTO_EXTRA';
      case 'EXTRA_INSTANCE': return 'INSTANCIA_EXTRA';
      case 'DAILY_BACKUP': return 'RESPALDO_DIARIO';
      case 'PRIORITY_SUPPORT': return 'SOPORTE_PRIORITARIO';
      default: return c;
    }
  });
  const res = await axiosClient.post(`/planes/${planId}/cotizar`, { complementos: normalizedComplementos });
  return res.data?.data || res.data;
};
