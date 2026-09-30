import { axiosClient } from './axiosClient';
import type { InstanciaDB } from '../types';

export const MOCK_INSTANCIAS: InstanciaDB[] = [];

export const getInstancias = async (): Promise<InstanciaDB[]> => {
  try {
    const res = await axiosClient.get('/instancias');
    return res.data?.data || res.data;
  } catch {
    console.warn('API /instancias no disponible. Retornando instancias Mock (vacío).');
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
      estado: 'active',
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

export const mapInstanciaDBToCInstancia = (dbInst: InstanciaDB): any => {
  const estadoMap: Record<string, "Activa" | "Reiniciando" | "Suspendida" | "Error"> = {
    active: "Activa",
    revision: "Reiniciando",
    suspended: "Suspendida",
    terminated: "Error",
    Activa: "Activa",
    Reiniciando: "Reiniciando",
    Suspendida: "Suspendida",
  };

  return {
    id: dbInst.id,
    nombre: dbInst.nombre,
    plantilla: (dbInst as any).plantilla || "Cultivos y parcelas",
    usadoGB: dbInst.almacenamientoUsadoGb || 0,
    totalGB: dbInst.almacenamientoTotalGb || 10,
    estado: estadoMap[dbInst.estado] || "Activa",
    creada: dbInst.fechaCreacion || new Date().toISOString().split("T")[0],
    version: dbInst.version || "PostgreSQL 16",
    host: dbInst.host || `${dbInst.nombre}.agrocloud.gt`,
    puerto: dbInst.puerto ? String(dbInst.puerto) : "5432",
    baseDatos: dbInst.databaseName || dbInst.nombre.replace(/-/g, "_"),
    usuario: dbInst.dbUser || "agro_db_user",
    password: "P@ssw0rd!" + Math.floor(Math.random() * 899 + 100),
    cpu: dbInst.cpu || 5,
    memoria: dbInst.memoria || 12,
    actividad: [
      { desc: "Instancia conectada a PostgreSQL", tiempo: "Hace un momento", tipo: "info" }
    ]
  };
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

