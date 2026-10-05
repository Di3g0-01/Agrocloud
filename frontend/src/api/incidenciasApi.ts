import { axiosClient } from './axiosClient';
import type { Incidencia } from '../types';
import type { Incident } from '../types/shared';
import type { Ticket } from '../types/cliente';

export const getIncidencias = async (): Promise<Incidencia[]> => {
  const res = await axiosClient.get('/incidencias');
  return res.data?.data || res.data;
};

export const resolverIncidencia = async (id: string): Promise<boolean> => {
  await axiosClient.patch(`/incidencias/${id}`, { estado: 'RESUELTA' });
  return true;
};

export const crearIncidencia = async (data: {
  instanciaId: string; asunto: string; categoria: string; problema: string; prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}): Promise<Incidencia> => {
  const res = await axiosClient.post('/incidencias', data);
  return res.data?.data || res.data;
};

export const actualizarIncidencia = async (id: string, data: { estado?: Incidencia['estado']; guiaDiagnostico?: string }): Promise<Incidencia> => {
  const res = await axiosClient.patch(`/incidencias/${id}`, data);
  return res.data?.data || res.data;
};

export const mapIncidenciaToIncident = (inc: Incidencia): Incident => ({
  id: inc.id, cliente: inc.cliente, instancia: inc.instanciaNombre, plantilla: inc.plantilla,
  asunto: inc.asunto, problema: inc.problema,
  prioridad: ({ ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' } as const)[inc.prioridad],
  estado: ({ ABIERTA: 'Abierta', EN_REVISION: 'En revisión', RESUELTA: 'Resuelta' } as const)[inc.estado],
  fecha: new Date(inc.fecha).toLocaleDateString('es-GT'), guia: inc.guiaDiagnostico || 'Pendiente de diagnóstico',
});

export const mapIncidenciaToTicket = (inc: Incidencia): Ticket => ({
  id: inc.id, asunto: inc.asunto, instancia: inc.instanciaNombre, categoria: inc.categoria,
  prioridad: ({ ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' } as const)[inc.prioridad],
  estado: ({ ABIERTA: 'Abierta', EN_REVISION: 'En proceso', RESUELTA: 'Resuelta' } as const)[inc.estado],
  descripcion: inc.problema, creado: new Date(inc.fecha).toLocaleDateString('es-GT'),
  actualizado: new Date(inc.actualizado).toLocaleDateString('es-GT'),
  historial: [{ autor: 'cliente', texto: inc.problema, fecha: new Date(inc.fecha).toLocaleString('es-GT') }],
});
