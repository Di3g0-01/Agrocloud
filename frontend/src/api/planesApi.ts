import { axiosClient } from './axiosClient';
import type { Plan } from '../types';

export const MOCK_PLANES: Plan[] = [
  {
    id: 'plan-finca',
    nombre: 'Finca',
    almacenamientoGb: 10,
    precioMensual: 25.0,
    descripcion: 'Ideal para pequeños productores y fincas que inician la digitalización de sus registros.',
    instanciasPermitidas: 1,
  },
  {
    id: 'plan-productor',
    nombre: 'Productor',
    almacenamientoGb: 50,
    precioMensual: 60.0,
    descripcion: 'Diseñado para productores agrícolas con un volumen creciente de datos operativos.',
    instanciasPermitidas: 1,
    popular: true,
  },
  {
    id: 'plan-agro-pro',
    nombre: 'Agro Pro',
    almacenamientoGb: 100,
    precioMensual: 120.0,
    descripcion: 'Para mediano y gran productor que requiere alta disponibilidad y respaldos automatizados.',
    instanciasPermitidas: 2,
  },
  {
    id: 'plan-enterprise',
    nombre: 'Agro Enterprise',
    almacenamientoGb: 250,
    precioMensual: 250.0,
    descripcion: 'Solución integral para cooperativas y empresas agroindustriales con alta demanda.',
    instanciasPermitidas: 5,
  },
];

export const getPlanes = async (): Promise<Plan[]> => {
  try {
    const res = await axiosClient.get('/planes');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /planes no disponible. Utilizando catálogo Mock.');
    return MOCK_PLANES;
  }
};
