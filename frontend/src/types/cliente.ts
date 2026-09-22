export type ClientePage =
  | "dashboard"
  | "instancias"
  | "plantillas"
  | "plan"
  | "pagos"
  | "soporte"
  | "configuracion"
  | "documentacion";

export interface CInstancia {
  nombre: string;
  plantilla: string;
  usadoGB: number;
  totalGB: number;
  estado: "Activa" | "Reiniciando" | "Suspendida" | "Error";
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

export interface CPlantillaDB {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  tablas: number;
  entidades: string[];
  casosDeUso: string[];
  icon: string;
}

export interface Pago {
  id: string;
  fecha: string;
  concepto: string;
  periodo: string;
  monto: number;
  metodo: string;
  referencia: string;
  estado: "Pagado";
}

export type TicketEstado = "Abierta" | "En proceso" | "Resuelta";
export type TicketPrioridad = "Alta" | "Media" | "Baja";

export interface TicketComentario {
  autor: "cliente" | "soporte";
  texto: string;
  fecha: string;
}

export interface Ticket {
  id: string;
  asunto: string;
  instancia: string;
  categoria: string;
  prioridad: TicketPrioridad;
  estado: TicketEstado;
  descripcion: string;
  creado: string;
  actualizado: string;
  historial: TicketComentario[];
}

