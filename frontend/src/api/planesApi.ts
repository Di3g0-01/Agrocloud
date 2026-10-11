import { axiosClient } from './axiosClient';
import type { Plan } from '../types';

export const getPlanes = async (): Promise<Plan[]> => {
  const res = await axiosClient.get('/planes');
  return res.data?.data || res.data;
};

export type PlanInput = Pick<Plan, 'nombre' | 'almacenamientoGb' | 'precioMensual' | 'descripcion' | 'instanciasPermitidas' | 'popular' | 'activo'>;
export const crearPlan = async (data: PlanInput): Promise<Plan> => (await axiosClient.post('/planes', data)).data;
export const actualizarPlan = async (id: string, data: PlanInput): Promise<Plan> => (await axiosClient.put(`/planes/${id}`, data)).data;
export const eliminarPlan = async (id: string): Promise<void> => { await axiosClient.delete(`/planes/${id}`); };
