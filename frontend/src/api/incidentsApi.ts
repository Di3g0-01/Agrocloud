import { axiosClient } from './axiosClient';
import type { IncidentRecord } from '../types';
import type { Incident } from '../types/shared';
import type { Ticket } from '../types/client';

export interface IncidentComment {
  id: string;
  autorId: string;
  autor: string;
  rolAutor: 'CLIENTE' | 'SOPORTE' | 'ADMINISTRADOR';
  texto: string;
  destinatario?: 'CLIENTE' | 'SOPORTE' | 'ADMIN';
  fecha: string;
}

export const getComments = async (incidentId: string): Promise<IncidentComment[]> =>
  (await axiosClient.get<IncidentComment[]>(`/incidencias/${incidentId}/comentarios`)).data;

export const createComment = async (incidentId: string, text: string, recipient?: string): Promise<IncidentComment> =>
  (await axiosClient.post<IncidentComment>(`/incidencias/${incidentId}/comentarios`, { texto: text, destinatario: recipient })).data;

export const editComment = async (commentId: string, bodyText: string): Promise<IncidentComment> =>
  (await axiosClient.put<IncidentComment>(`/incidencias/comentarios/${commentId}`, { texto: bodyText })).data;

export const deleteComment = async (commentId: string): Promise<void> =>
  (await axiosClient.delete(`/incidencias/comentarios/${commentId}`)).data;

export const getIncidents = async (): Promise<IncidentRecord[]> => {
  const res = await axiosClient.get('/incidencias');
  return res.data?.data || res.data;
};

export const getSupportActivity = async (): Promise<IncidentRecord[]> => {
  const res = await axiosClient.get<IncidentRecord[]>('/incidencias/actividad');
  return res.data;
};

export const resolveIncident = async (id: string, resolutionMessage: string): Promise<IncidentRecord> => {
  const res = await axiosClient.patch(`/incidencias/${id}/estado`, { estado: 'RESUELTA', mensajeResolucion: resolutionMessage });
  return res.data?.data || res.data;
};

export const createIncident = async (data: {
  instanciaId: string; asunto: string; categoria: string; problema: string; prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
}): Promise<IncidentRecord> => {
  const res = await axiosClient.post('/incidencias', data);
  return res.data?.data || res.data;
};

export const updateIncident = async (id: string, data: { estado?: IncidentRecord['estado']; guiaDiagnostico?: string; mensajeResolucion?: string }): Promise<IncidentRecord> => {
  const res = await axiosClient.patch(`/incidencias/${id}`, data);
  return res.data?.data || res.data;
};

export const assignIncident = async (id: string, agentId: string): Promise<IncidentRecord> => {
  const res = await axiosClient.patch(`/incidencias/${id}/asignacion`, { agenteId: agentId });
  return res.data?.data || res.data;
};

export const mapIncidentRecordToIncident = (inc: IncidentRecord): Incident => ({
  id: inc.id, codigo: inc.codigo, cliente: inc.cliente, instancia: inc.instanciaNombre, plantilla: inc.plantilla,
  asunto: inc.asunto, problema: inc.problema,
  prioridad: ({ ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' } as const)[inc.prioridad],
  estado: ({ ABIERTA: 'Abierta', EN_REVISION: 'En revisión', RESUELTA: 'Resuelta', CERRADA: 'Cerrada' } as const)[inc.estado],
  fecha: new Date(inc.fecha).toLocaleDateString('es-GT'), guia: inc.guiaDiagnostico || 'Pendiente de diagnóstico',
  mensajeResolucion: inc.mensajeResolucion,
  agenteId: inc.agenteId,
});

export const mapIncidentRecordToTicket = (inc: IncidentRecord): Ticket => ({
  id: inc.id, codigo: inc.codigo, asunto: inc.asunto, instancia: inc.instanciaNombre, categoria: inc.categoria,
  prioridad: ({ ALTA: 'Alta', MEDIA: 'Media', BAJA: 'Baja' } as const)[inc.prioridad],
  estado: ({ ABIERTA: 'Abierta', EN_REVISION: 'En proceso', RESUELTA: 'Resuelta', CERRADA: 'Cerrada' } as const)[inc.estado],
  descripcion: inc.problema, creado: new Date(inc.fecha).toLocaleDateString('es-GT'),
  actualizado: new Date(inc.actualizado).toLocaleDateString('es-GT'),
  historial: [{ autor: 'cliente', texto: inc.problema, fecha: new Date(inc.fecha).toLocaleString('es-GT') }],
  mensajeResolucion: inc.mensajeResolucion,
});
