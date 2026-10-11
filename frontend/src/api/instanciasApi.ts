import { axiosClient } from './axiosClient';
import type { InstanciaDB } from '../types';

export const getInstancias = async (): Promise<InstanciaDB[]> => {
  const res = await axiosClient.get('/instancias');
  return res.data?.data || res.data;
};

export const crearInstancia = async (data: { nombre: string; plantilla?: string }): Promise<InstanciaDB> => {
  const res = await axiosClient.post('/instancias', data);
  return res.data?.data || res.data;
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
    plantilla: dbInst.plantilla || "Sin plantilla",
    usadoGB: dbInst.almacenamientoUsadoGb || 0,
    totalGB: dbInst.almacenamientoTotalGb || 10,
    estado: estadoMap[dbInst.estado] || "Activa",
    creada: dbInst.fechaCreacion || new Date().toISOString().split("T")[0],
    version: dbInst.version || "PostgreSQL 16",
    host: dbInst.host || `${dbInst.nombre}.agrocloud.gt`,
    puerto: dbInst.puerto ? String(dbInst.puerto) : "5432",
    baseDatos: dbInst.databaseName || dbInst.nombre.replace(/-/g, "_"),
    usuario: dbInst.dbUser || "agro_db_user",
    password: "",
    cpu: dbInst.cpu || 5,
    memoria: dbInst.memoria || 12,
    actividad: [
      { desc: "Instancia conectada a PostgreSQL", tiempo: "Hace un momento", tipo: "info" }
    ]
  };
};

export const reiniciarInstancia = async (id: string): Promise<boolean> => {
  await axiosClient.post(`/instancias/${id}/restart`);
  return true;
};

export const eliminarInstancia = async (id: string): Promise<boolean> => {
  await axiosClient.delete(`/instancias/${id}`);
  return true;
};

export const actualizarEstadoInstancia = async (id: string, status: 'active' | 'revision' | 'suspended' | 'terminated'): Promise<InstanciaDB> => {
  const res = await axiosClient.patch(`/instancias/${id}/status`, null, { params: { status } });
  return res.data?.data || res.data;
};

