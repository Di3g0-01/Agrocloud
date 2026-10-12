import { axiosClient } from './axiosClient';
import type { DbInstance } from '../types';

export const getInstances = async (): Promise<DbInstance[]> => {
  const res = await axiosClient.get('/instancias');
  return res.data?.data || res.data;
};

export const createInstance = async (data: { nombre: string; plantilla?: string }): Promise<DbInstance> => {
  const res = await axiosClient.post('/instancias', data);
  return res.data?.data || res.data;
};

export const mapDbInstanceToClientInstance = (dbInst: DbInstance): any => {
  const statusMap: Record<string, "Operativa" | "En revisión" | "Reiniciando" | "Suspendida" | "Error"> = {
    active: "Operativa",
    revision: "En revisión",
    "En revisión": "En revisión",
    suspended: "Suspendida",
    terminated: "Error",
    Operativa: "Operativa",
    Activa: "Operativa",
    Reiniciando: "En revisión",
    Suspendida: "Suspendida",
  };

  return {
    id: dbInst.id,
    nombre: dbInst.nombre,
    plantilla: dbInst.plantilla || "Sin plantilla",
    usadoGB: dbInst.almacenamientoUsadoGb || 0,
    totalGB: dbInst.almacenamientoTotalGb || 10,
    estado: statusMap[dbInst.estado] || "Operativa",
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

export const restartInstance = async (id: string): Promise<boolean> => {
  await axiosClient.post(`/instancias/${id}/restart`);
  return true;
};

export const deleteInstance = async (id: string): Promise<boolean> => {
  await axiosClient.delete(`/instancias/${id}`);
  return true;
};

export const updateInstanceStatus = async (id: string, status: 'active' | 'revision' | 'suspended' | 'terminated'): Promise<DbInstance> => {
  const res = await axiosClient.patch(`/instancias/${id}/status`, null, { params: { status } });
  return res.data?.data || res.data;
};

export interface InstanceCredentialsResponse {
  instanciaId: string;
  nombreInstancia: string;
  host: string;
  puerto: number;
  databaseName: string;
  dbUser: string;
  password: string;
  region: string;
  versionEngine: string;
}

export const getInstanceCredentials = async (id: string): Promise<InstanceCredentialsResponse> => {
  const res = await axiosClient.get(`/instancias/${id}/credenciales`);
  return res.data?.data || res.data;
};

export interface MetricEntry {
  id: string;
  instanciaId: string;
  almacenamientoUsadoGb: number;
  almacenamientoTotalGb: number;
  cpuUsoPorcentaje: number;
  memoriaUsoPorcentaje: number;
  estado: string;
  timestamp: string;
}

export interface InstanceMetricsResponse {
  instanciaId: string;
  nombreInstancia: string;
  estadoActual: string;
  almacenamientoUsadoGb: number;
  almacenamientoTotalGb: number;
  porcentajeAlmacenamientoUsado: number;
  cpuActualPercentage: number;
  memoriaActualPercentage: number;
  uptime: string;
  historialMetricas: MetricEntry[];
}

export const getInstanceMetrics = async (id: string): Promise<InstanceMetricsResponse> => {
  const res = await axiosClient.get(`/instancias/${id}/metricas`);
  return res.data?.data || res.data;
};


