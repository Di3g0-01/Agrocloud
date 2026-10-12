export type ClientPage =
  | "dashboard"
  | "instancias"
  | "plantillas"
  | "plan"
  | "pagos"
  | "soporte"
  | "configuracion"
  | "documentacion";

export interface ClientInstance {
  id?: string;
  nombre: string;
  plantilla: string;
  usadoGB: number;
  totalGB: number;
  estado: "Operativa" | "Activa" | "Reiniciando" | "Suspendida" | "Error";
  creada: string;
  version: string;
  host: string;
  puerto: string;
  baseDatos: string;
  usuario: string;
  password: string;
  cpu: number;
  memoria: number;
  actividad: { desc: string; tiempo: string; tipo: "ok" | "warn" | "info" }[];
}

export interface ClientDbTemplate {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  tablas: number;
  entidades: string[];
  casosDeUso: string[];
  icon: string;
}

export interface Payment {
  id: string;
  fecha: string;
  concepto: string;
  periodo: string;
  monto: number;
  metodo: string;
  referencia: string;
  estado: "Pagado";
}

export type TicketStatus = "Abierta" | "En proceso" | "Resuelta" | "Cerrada";
export type TicketPriority = "Alta" | "Media" | "Baja";

export interface TicketComment {
  autor: "cliente" | "soporte";
  texto: string;
  fecha: string;
}

export interface Ticket {
  id: string;
  codigo: string;
  asunto: string;
  instancia: string;
  categoria: string;
  prioridad: TicketPriority;
  estado: TicketStatus;
  descripcion: string;
  creado: string;
  actualizado: string;
  historial: TicketComment[];
  mensajeResolucion?: string | null;
}

