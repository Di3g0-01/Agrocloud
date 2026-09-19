export type UserRole = 'ADMIN' | 'CLIENTE' | 'SOPORTE';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  empresa?: string;
  fechaRegistro?: string;
  estado?: 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO';
}

export interface Plan {
  id: string;
  nombre: string;
  almacenamientoGb: number;
  precioMensual: number;
  descripcion: string;
  instanciasPermitidas: number;
  popular?: boolean;
}

export interface InstanciaDB {
  id: string;
  nombre: string;
  cliente: string;
  usuarioId: string;
  tipo: string;
  estado: 'OPERATIVA' | 'EN_REVISION' | 'DETENIDA' | 'SUSPENDIDA';
  version: string;
  uptime: string;
  cpu: number;
  memoria: number;
  almacenamientoUsadoGb: number;
  almacenamientoTotalGb: number;
  region: string;
  host?: string;
  puerto?: number;
  databaseName?: string;
  dbUser?: string;
  fechaCreacion?: string;
}

export interface Suscripcion {
  id: string;
  planId: string;
  planNombre: string;
  usuarioId: string;
  estado: 'ACTIVA' | 'SUSPENDIDA' | 'CANCELADA';
  fechaInicio: string;
  fechaProximoPago: string;
  monto: number;
}

export interface Incidencia {
  id: string;
  cliente: string;
  instanciaId: string;
  instanciaNombre: string;
  plantilla: string;
  asunto: string;
  problema: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA';
  fecha: string;
  guiaDiagnostico?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
