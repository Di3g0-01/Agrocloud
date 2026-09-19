import { axiosClient } from './axiosClient';
import type { Incidencia } from '../types';

export const MOCK_INCIDENCIAS: Incidencia[] = [
  {
    id: 'INC-024',
    cliente: 'Finca Los Pinos',
    instanciaId: 'inst-01',
    instanciaNombre: 'agro-produccion-db',
    plantilla: 'Cosechas y producción',
    asunto: 'Latencia elevada en consultas de producción',
    problema: 'La instancia presenta lentitud al procesar reportes desde las 08:00 hrs.',
    prioridad: 'ALTA',
    estado: 'EN_REVISION',
    fecha: '2026-09-05',
    guiaDiagnostico: 'Verificar índices de PostgreSQL y revisar consumo de RAM/CPU en monitoreo.',
  },
  {
    id: 'INC-023',
    cliente: 'Finca El Roble',
    instanciaId: 'inst-02',
    instanciaNombre: 'agro-inventario-db',
    plantilla: 'Control de inventarios',
    asunto: 'Instancia en estado de revisión tras reinicio',
    problema: 'El servicio de base de datos no restableció automáticamente el pool de conexiones.',
    prioridad: 'MEDIA',
    estado: 'ABIERTA',
    fecha: '2026-09-05',
    guiaDiagnostico: 'Revisar logs de arranque de PostgreSQL y archivo pg_hba.conf.',
  },
  {
    id: 'INC-022',
    cliente: 'Cooperativa Occidente',
    instanciaId: 'inst-03',
    instanciaNombre: 'coop-occidente-db',
    plantilla: 'Gestión financiera',
    asunto: 'Consulta sobre configuración de respaldos',
    problema: 'El usuario solicita confirmar la ventana de tiempo para los backups automáticos.',
    prioridad: 'BAJA',
    estado: 'RESUELTA',
    fecha: '2026-09-04',
    guiaDiagnostico: 'Confirmar cronjob de pg_dump en la infraestructura cloud.',
  },
];

export const getIncidencias = async (): Promise<Incidencia[]> => {
  try {
    const res = await axiosClient.get('/incidencias');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /incidencias no disponible. Retornando incidencias Mock.');
    return MOCK_INCIDENCIAS;
  }
};

export const resolverIncidencia = async (id: string): Promise<boolean> => {
  try {
    await axiosClient.patch(`/incidencias/${id}`, { estado: 'RESUELTA' });
    return true;
  } catch {
    console.warn(`Simulando resolución de incidencia ${id}...`);
    return true;
  }
};
