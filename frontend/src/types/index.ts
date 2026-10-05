export type UserRole = 'ADMIN' | 'CLIENTE' | 'SOPORTE';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  empresa?: string;
  telefono?: string;
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
  activo?: boolean;
}

export interface InstanciaDB {
  id: string;
  nombre: string;
  plantilla: string;
  cliente: string;
  usuarioId: string;
  tipo: string;
  estado: 'active' | 'revision' | 'suspended' | 'terminated';
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
  estado: 'pending_payment' | 'active' | 'suspended' | 'cancelled';
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
  categoria: string;
  problema: string;
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estado: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA';
  fecha: string;
  actualizado: string;
  guiaDiagnostico?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
