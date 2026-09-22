export type Role = "landing" | "login" | "admin" | "cliente" | "soporte";

export interface Incident {
  id: string;
  cliente: string;
  instancia: string;
  plantilla: string;
  asunto: string;
  problema: string;
  prioridad: "Alta" | "Media" | "Baja";
  estado: "Abierta" | "En revisión" | "Resuelta";
  fecha: string;
  guia: string;
}

export interface Instance {
  nombre: string;
  cliente: string;
  tipo: string;
  estado: "Operativa" | "En revisión" | "Detenida";
  version: string;
  uptime: string;
  cpu: number;
  memoria: number;
  region: string;
}

export interface ActivityLog {
  id: string;
  tipo: "asignada" | "revisada" | "actualizada" | "resuelta" | "abierta";
  descripcion: string;
  incidencia: string;
  tiempo: string;
}
