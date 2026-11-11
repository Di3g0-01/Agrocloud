import { axiosClient } from './axiosClient';
import type { Subscription } from '../types';

export const getMyActiveSubscription = async (): Promise<Subscription | null> => {
  try {
    const res = await axiosClient.get('/suscripciones/activa');
    return res.data?.data || res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

export const getMySubscriptions = async (): Promise<Subscription[]> => {
  const res = await axiosClient.get('/suscripciones/me');
  return res.data?.data || res.data;
};

export const subscribeToPlan = async (planId: string, planName?: string, amount?: number): Promise<Subscription> => {
  void planName; void amount;
  const res = await axiosClient.post('/suscripciones', { planId });
  return res.data?.data || res.data;
};

const normalizeAddons = (addons?: string[]): string[] | undefined => {
  if (!addons) return undefined;
  return addons.map((c) => {
    switch (c) {
      case 'EXTRA_STORAGE': return 'ALMACENAMIENTO_EXTRA';
      case 'EXTRA_INSTANCE': return 'INSTANCIA_EXTRA';
      case 'DAILY_BACKUP': return 'RESPALDO_DIARIO';
      case 'PRIORITY_SUPPORT': return 'SOPORTE_PRIORITARIO';
      default: return c;
    }
  });
};

export const preparePlanChange = async (planId: string, complementos?: string[]): Promise<Subscription> => {
  const res = await axiosClient.post('/suscripciones/cambiar', { planId, complementos: normalizeAddons(complementos) });
  return res.data?.data || res.data;
};

export const updateSubscriptionAddons = async (complementos: string[]): Promise<Subscription> => {
  const res = await axiosClient.post('/suscripciones/complementos', { complementos: normalizeAddons(complementos) });
  return res.data?.data || res.data;
};

export const confirmPlanChangePayment = async (subscriptionId: string): Promise<Subscription> => {
  const res = await axiosClient.post(`/suscripciones/${subscriptionId}/confirmar-pago`);
  return res.data?.data || res.data;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const res = await axiosClient.post(`/suscripciones/${id}/cancelar`);
  return res.data?.data || res.data;
};

export const continueSubscription = async (id: string): Promise<Subscription> => {
  const res = await axiosClient.post(`/suscripciones/${id}/continuar`);
  return res.data?.data || res.data;
};

export const getAllSubscriptions = async (): Promise<Subscription[]> => (await axiosClient.get('/suscripciones')).data;
export const updateSubscriptionStatus = async (id: string, status: Subscription['estado']): Promise<Subscription> =>
  (await axiosClient.patch(`/suscripciones/${id}/status`, null, { params: { status } })).data;
