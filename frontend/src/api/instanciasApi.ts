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
  const estadoMap: Record<string, "Operativa" | "En revisión" | "Reiniciando" | "Suspendida" | "Error"> = {
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
    estado: estadoMap[dbInst.estado] || "Operativa",
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

export interface CredencialesInstanciaResponse {
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

export const getCredencialesInstancia = async (id: string): Promise<CredencialesInstanciaResponse> => {
  const res = await axiosClient.get(`/instancias/${id}/credenciales`);
  return res.data?.data || res.data;
};

export interface MetricaEntry {
  id: string;
  instanciaId: string;
  almacenamientoUsadoGb: number;
  almacenamientoTotalGb: number;
  cpuUsoPorcentaje: number;
  memoriaUsoPorcentaje: number;
  estado: string;
  timestamp: string;
}

export interface MetricasInstanciaResponse {
  instanciaId: string;
  nombreInstancia: string;
  estadoActual: string;
  almacenamientoUsadoGb: number;
  almacenamientoTotalGb: number;
  porcentajeAlmacenamientoUsado: number;
  cpuActualPercentage: number;
  memoriaActualPercentage: number;
  uptime: string;
  historialMetricas: MetricaEntry[];
}

export const getMetricasInstancia = async (id: string): Promise<MetricasInstanciaResponse> => {
  const res = await axiosClient.get(`/instancias/${id}/metricas`);
  return res.data?.data || res.data;
};


