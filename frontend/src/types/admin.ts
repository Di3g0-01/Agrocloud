export type AdminPage =
  | "dashboard"
  | "clientes"
  | "usuarios"
  | "instancias"
  | "suscripciones"
  | "pagos"
  | "plantillas"
  | "monitoreo"
  | "incidencias"
  | "configuracion"
  | "documentacion";

export type ManagedUserRole = "Cliente" | "Soporte" | "Administrador";
export type ManagedUserStatus = "Activo" | "Pendiente" | "Suspendido";

export interface ManagedUser {
  id: string;
  nombre: string;
  correo: string;
  rol: ManagedUserRole;
  org: string;
  estado: ManagedUserStatus;
  registro: string;
  acceso: string;
}

export interface AdminClient {
  id: string;
  nombre: string;
  tipo: string;
  responsable: string;
  correo: string;
  telefono: string;
  plan: string;
  instancias: number;
  suscripcion: string;
  estado: string;
  registro: string;
  almacenamiento: string;
}

export interface AdminInstance {
  id: string;
  nombre: string;
  cliente: string;
  plantilla: string;
  plan: string;
  almacenamiento: string;
  estado: string;
  creada: string;
  cpu: number;
  ram: number;
  conexiones: number;
}

export interface Subscription {
  id: string;
  cliente: string;
  plan: string;
  precio: string;
  inicio: string;
  renovacion: string;
  estado: string;
}

export interface AdminPayment {
  id: string;
  cliente: string;
  concepto: string;
  monto: number;
  metodo: string;
  fecha: string;
  estado: string;
}

export interface AdminTemplate {
  id: string;
  nombre: string;
  descripcion: string;
  tablas: number;
  version: string;
  instancias: number;
  estado: string;
  actualizada: string;
  schema: string[];
}
