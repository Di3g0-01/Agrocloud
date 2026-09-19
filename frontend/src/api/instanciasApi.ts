import { axiosClient } from './axiosClient';
import type { InstanciaDB } from '../types';

export const MOCK_INSTANCIAS: InstanciaDB[] = [
  {
    id: 'inst-01',
    nombre: 'agro-produccion-db',
    cliente: 'Finca Los Pinos',
    usuarioId: 'usr-1',
    tipo: 'PostgreSQL 16',
    estado: 'OPERATIVA',
    version: 'v16.2',
    uptime: '99.9%',
    cpu: 24,
    memoria: 48,
    almacenamientoUsadoGb: 6.2,
    almacenamientoTotalGb: 10,
    region: 'us-east-1 (Virginia)',
    host: 'db.agrocloud.gt',
    puerto: 5432,
    databaseName: 'produccion_db',
    dbUser: 'agrouser_lospinos',
    fechaCreacion: '2026-08-15',
  },
  {
    id: 'inst-02',
    nombre: 'agro-inventario-db',
    cliente: 'Finca El Roble',
    usuarioId: 'usr-2',
    tipo: 'PostgreSQL 16',
    estado: 'EN_REVISION',
    version: 'v16.1',
    uptime: '98.5%',
    cpu: 76,
    memoria: 82,
    almacenamientoUsadoGb: 38.4,
    almacenamientoTotalGb: 50,
    region: 'us-east-1 (Virginia)',
    host: 'db2.agrocloud.gt',
    puerto: 5432,
    databaseName: 'inventario_roble',
    dbUser: 'agrouser_roble',
    fechaCreacion: '2026-08-20',
  },
  {
    id: 'inst-03',
    nombre: 'coop-occidente-db',
    cliente: 'Cooperativa Occidente',
    usuarioId: 'usr-3',
    tipo: 'PostgreSQL 16',
    estado: 'OPERATIVA',
    version: 'v16.2',
    uptime: '99.99%',
    cpu: 18,
    memoria: 35,
    almacenamientoUsadoGb: 42.1,
    almacenamientoTotalGb: 100,
    region: 'us-west-2 (Oregon)',
    host: 'db3.agrocloud.gt',
    puerto: 5432,
    databaseName: 'coop_occidente_db',
    dbUser: 'coop_admin',
    fechaCreacion: '2026-09-01',
  },
];

export const getInstancias = async (): Promise<InstanciaDB[]> => {
  try {
    const res = await axiosClient.get('/instancias');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /instancias no disponible. Retornando instancias Mock.');
    return MOCK_INSTANCIAS;
  }
};

export const crearInstancia = async (data: { nombre: string; plantilla?: string }): Promise<InstanciaDB> => {
  try {
    const res = await axiosClient.post('/instancias', data);
    return res.data?.data || res.data;
  } catch {
    console.warn('API /instancias no disponible. Creando instancia Mock.');
    const nueva: InstanciaDB = {
      id: 'inst-' + Date.now(),
      nombre: data.nombre,
      cliente: 'Usuario Conectado',
      usuarioId: 'usr-current',
      tipo: 'PostgreSQL 16',
      estado: 'OPERATIVA',
      version: 'v16.2',
      uptime: '100%',
      cpu: 5,
      memoria: 12,
      almacenamientoUsadoGb: 0.1,
      almacenamientoTotalGb: 10,
      region: 'us-east-1 (Virginia)',
      host: `db-${data.nombre}.agrocloud.gt`,
      puerto: 5432,
      databaseName: data.nombre.replace(/-/g, '_'),
      dbUser: 'agro_db_user',
      fechaCreacion: new Date().toISOString().split('T')[0],
    };
    return nueva;
  }
};

export const reiniciarInstancia = async (id: string): Promise<boolean> => {
  try {
    await axiosClient.post(`/instancias/${id}/restart`);
    return true;
  } catch {
    console.warn(`Simulando reinicio de la instancia ${id}...`);
    return true;
  }
};

export const eliminarInstancia = async (id: string): Promise<boolean> => {
  try {
    await axiosClient.delete(`/instancias/${id}`);
    return true;
  } catch {
    console.warn(`Simulando eliminación de la instancia ${id}...`);
    return true;
  }
};
