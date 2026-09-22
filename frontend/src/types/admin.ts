export type AdminPage =
  | "dashboard"
  | "clientes"
  | "instancias"
  | "suscripciones"
  | "pagos"
  | "plantillas"
  | "monitoreo"
  | "incidencias"
  | "configuracion"
  | "documentacion";

export type UsuarioRol = "Cliente" | "Soporte" | "Administrador";
export type UsuarioEstado = "Activo" | "Pendiente" | "Suspendido";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: UsuarioRol;
  org: string;
  estado: UsuarioEstado;
  registro: string;
  acceso: string;
}

export interface ClienteAdmin {
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

export interface InstanciaAdmin {
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

export interface Suscripcion {
  id: string;
  cliente: string;
  plan: string;
  precio: string;
  inicio: string;
  renovacion: string;
  estado: string;
}

export interface PagoAdmin {
  id: string;
  cliente: string;
  concepto: string;
  monto: number;
  metodo: string;
  fecha: string;
  estado: string;
}

export interface PlantillaAdmin {
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
