import type { Incident, Instance, ActivityLog } from "../types/shared";

export const incidents: Incident[] = [];

export const instances: Instance[] = [];

export const activityLogs: ActivityLog[] = [];

export const templates: string[] = [];

export interface Documento {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: "General" | "Conexiones" | "Plantillas" | "Seguridad" | "Manuales";
  destino: "cliente" | "soporte";
  archivoNombre: string;
  archivoTamano: string;
  contenido: string;
  fecha: string;
  autor: string;
}

export const INITIAL_DOCS: Documento[] = [];



