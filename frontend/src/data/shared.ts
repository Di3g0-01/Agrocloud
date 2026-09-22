import type { Incident, Instance, ActivityLog } from "../types/shared";

export const incidents: Incident[] = [
  { id: "INC-024", cliente: "Finca Los Pinos", instancia: "agro-produccion-db", plantilla: "Cosechas y producción", asunto: "Problema de conexión", problema: "La instancia no responde a las consultas de producción desde las 08:00 hrs.", prioridad: "Alta", estado: "En revisión", fecha: "2026-09-05", guia: "Verificar conectividad de red y revisar logs del servidor de base de datos." },
  { id: "INC-023", cliente: "Finca El Roble", instancia: "agro-inventario-db", plantilla: "Control de inventarios", asunto: "Instancia detenida", problema: "El módulo de inventario dejó de funcionar tras la última actualización.", prioridad: "Media", estado: "Abierta", fecha: "2026-09-05", guia: "Revisar changelog de la última actualización y revertir si es necesario." },
  { id: "INC-022", cliente: "Cooperativa Occidente", instancia: "coop-occidente-db", plantilla: "Gestión financiera", asunto: "Error en reportes", problema: "Los reportes mensuales muestran valores negativos en el balance.", prioridad: "Alta", estado: "En revisión", fecha: "2026-09-04", guia: "Validar las fórmulas de cálculo en el módulo de reportes financieros." },
  { id: "INC-021", cliente: "Hacienda Santa Cruz", instancia: "santa-cruz-db", plantilla: "Gestión de personal", asunto: "Acceso denegado", problema: "Varios usuarios reportan que no pueden acceder al sistema.", prioridad: "Baja", estado: "Resuelta", fecha: "2026-09-03", guia: "Restablecer permisos de usuario y verificar políticas de contraseñas." },
  { id: "INC-020", cliente: "Agrícola Del Norte", instancia: "agricola-norte-db", plantilla: "Trazabilidad", asunto: "Datos duplicados", problema: "El sistema genera registros duplicados al importar datos desde móviles.", prioridad: "Media", estado: "Resuelta", fecha: "2026-09-02", guia: "Revisar el proceso de sincronización móvil y agregar validación de duplicados." },
];

export const instances: Instance[] = [
  { nombre: "agro-produccion-db", cliente: "Finca Los Pinos", tipo: "PostgreSQL", estado: "En revisión", version: "v3.2.1", uptime: "99.1%", cpu: 78, memoria: 62, region: "us-east-1" },
  { nombre: "agro-inventario-db", cliente: "Finca El Roble", tipo: "PostgreSQL", estado: "Detenida", version: "v3.1.8", uptime: "0%", cpu: 0, memoria: 0, region: "us-east-1" },
  { nombre: "coop-occidente-db", cliente: "Coop. Occidente", tipo: "PostgreSQL", estado: "Operativa", version: "v3.2.1", uptime: "99.9%", cpu: 34, memoria: 45, region: "us-west-2" },
  { nombre: "santa-cruz-db", cliente: "Hacienda Santa Cruz", tipo: "PostgreSQL", estado: "Operativa", version: "v3.0.5", uptime: "99.7%", cpu: 22, memoria: 38, region: "us-east-1" },
  { nombre: "agricola-norte-db", cliente: "Agrícola Del Norte", tipo: "PostgreSQL", estado: "Operativa", version: "v3.2.0", uptime: "99.8%", cpu: 41, memoria: 55, region: "eu-west-1" },
  { nombre: "cafe-export-db", cliente: "Café Export S.A.", tipo: "PostgreSQL", estado: "Detenida", version: "v3.2.1", uptime: "0%", cpu: 0, memoria: 0, region: "us-east-1" },
];

export const activityLogs: ActivityLog[] = [
  { id: "1", tipo: "asignada", descripcion: "Incidencia asignada a soporte técnico", incidencia: "INC-024", tiempo: "hace 6 min" },
  { id: "2", tipo: "revisada", descripcion: "Instancia revisada y monitoreada", incidencia: "agro-produccion-db", tiempo: "hace 24 min" },
  { id: "3", tipo: "actualizada", descripcion: "Estado actualizado a En revisión", incidencia: "INC-023", tiempo: "hace 1 h" },
  { id: "4", tipo: "resuelta", descripcion: "Incidencia resuelta exitosamente", incidencia: "INC-021", tiempo: "hace 2 h" },
  { id: "5", tipo: "abierta", descripcion: "Nueva incidencia registrada", incidencia: "INC-022", tiempo: "hace 3 h" },
  { id: "6", tipo: "abierta", descripcion: "Instancia suspendida por inactividad", incidencia: "cafe-export-db", tiempo: "hace 5 h" },
];

export const templates: string[] = [
  "Cultivos y parcelas",
  "Cosechas y producción",
  "Control de inventarios",
  "Gestión de trabajadores",
  "Maquinaria",
  "Proveedores",
  "Clientes y ventas"
];

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

export const INITIAL_DOCS: Documento[] = [
  {
    id: "DOC-001",
    titulo: "Guía de Conexión a PostgreSQL para Clientes",
    descripcion: "Instrucciones paso a paso para conectarse desde pgAdmin, DBeaver o librerías de código.",
    categoria: "Conexiones",
    destino: "cliente",
    archivoNombre: "guia_conexion_postgresql_v1.2.pdf",
    archivoTamano: "2.4 MB",
    contenido: "Todas las instancias de AgroCloud están aprovisionadas con PostgreSQL 14+ y aceptan conexiones seguras TLS/SSL. Utiliza el host, puerto y credenciales proporcionadas en los detalles de tu instancia.",
    fecha: "2026-09-01",
    autor: "David Admin"
  },
  {
    id: "DOC-002",
    titulo: "Manual de Estructura de Schemas y Plantillas",
    descripcion: "Documentación técnica detallada de las tablas de Cultivos, Inventarios y Cosechas.",
    categoria: "Plantillas",
    destino: "cliente",
    archivoNombre: "manual_schemas_agricolas.pdf",
    archivoTamano: "4.1 MB",
    contenido: "Las plantillas preconfiguradas incluyen estructuras relacionales optimizadas para el sector agrícola: Cultivos, Cosechas, Inventario, Trabajadores, Maquinaria y Clientes.",
    fecha: "2026-09-03",
    autor: "David Admin"
  },
  {
    id: "DOC-003",
    titulo: "Protocolo de Diagnóstico y Resolución de Incidencias L2",
    descripcion: "Procedimiento operativo para el equipo de soporte técnico ante caídas de instancias o bloqueos.",
    categoria: "Manuales",
    destino: "soporte",
    archivoNombre: "soporte_protocolo_diagnostico_l2.pdf",
    archivoTamano: "1.8 MB",
    contenido: "Pasos de verificación: 1. Comprobar salud del host en AWS. 2. Revisar logs de PGADMIN. 3. Validar cuota de almacenamiento utilizada antes de reiniciar el servicio.",
    fecha: "2026-09-04",
    autor: "David Admin"
  },
  {
    id: "DOC-004",
    titulo: "Políticas de Seguridad, SSL y Copias de Seguridad",
    descripcion: "Guía de mejores prácticas de cifrado, rotación de claves y restauración de backups.",
    categoria: "Seguridad",
    destino: "soporte",
    archivoNombre: "politicas_seguridad_backups.pdf",
    archivoTamano: "3.2 MB",
    contenido: "Las copias de seguridad automáticas se ejecutan diariamente a las 02:00 UTC. La rotación de certificados SSL debe realizarse semestralmente.",
    fecha: "2026-09-05",
    autor: "David Admin"
  }
];

