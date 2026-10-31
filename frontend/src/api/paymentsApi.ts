import { axiosClient } from './axiosClient';

export interface BackendPayment {
  id: string;
  suscripcionId: string;
  planNombre: string;
  monto: number;
  fecha: string; // ISO string
  estado: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REJECTED';
  referencia: string;
  metodoPago: string;
  concepto: string;
  clienteNombre?: string;
  clienteEmail?: string;
}

export interface BackendInvoice {
  id: string;
  pagoId: string;
  suscripcionId: string;
  numeroFactura: string;
  fechaEmision: string; // ISO string
  clienteNombre: string;
  clienteEmail: string;
  concepto: string;
  subtotal: number;
  impuesto: number;
  total: number;
  metodoPago: string;
  referenciaPago: string;
  estado: string;
}

export const getMyPayments = async (): Promise<BackendPayment[]> => {
  const res = await axiosClient.get('/pagos/me');
  return res.data?.data || res.data || [];
};

export const getPaymentsBySubscription = async (subscriptionId: string): Promise<BackendPayment[]> => {
  const res = await axiosClient.get(`/pagos/suscripcion/${subscriptionId}`);
  return res.data?.data || res.data || [];
};

export const getAllPaymentsAdmin = async (): Promise<BackendPayment[]> => {
  const res = await axiosClient.get('/pagos');
  return res.data?.data || res.data || [];
};

export const getInvoiceByPaymentId = async (paymentId: string): Promise<BackendInvoice> => {
  const res = await axiosClient.get(`/facturas/pago/${paymentId}`);
  return res.data?.data || res.data;
};
