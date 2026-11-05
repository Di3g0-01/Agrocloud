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

export const preparePlanChange = async (planId: string): Promise<Subscription> => {
  const res = await axiosClient.post('/suscripciones/cambiar', { planId });
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
