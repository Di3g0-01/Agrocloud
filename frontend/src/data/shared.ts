import type { Incident, Instance, ActivityLog } from "../types/shared";

export const incidents: Incident[] = [];

export const instances: Instance[] = [];

export const activityLogs: ActivityLog[] = [];

export const templates: string[] = [];

export interface DocItem {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: "General" | "Conexiones" | "Plantillas" | "Seguridad" | "Manuales";
  destino: "cliente" | "soporte" | "todos";
  archivoNombre: string;
  archivoTamano: string;
  archivoUrl: string;
  contenido: string;
  fecha: string;
  autor: string;
}

export const INITIAL_DOCS: DocItem[] = [
  {
    id: "DOC-TEC-001",
    titulo: "Manual Técnico de AgroCloud",
    descripcion: "Documentación técnica oficial del sistema: arquitectura por capas, backend en Spring Boot, frontend en React 19, esquemas multitenant PostgreSQL, cifrado militar AES-256 GCM, especificación API REST y despliegue.",
    categoria: "Manuales",
    destino: "todos",
    archivoNombre: "AgroCloud_Manual_Tecnico.pdf",
    archivoTamano: "3.5 MB",
    archivoUrl: "/documentation/AgroCloud_Manual_Tecnico.pdf",
    contenido: `CONTENIDO DEL MANUAL TÉCNICO OFICIAL:

1. INTRODUCCIÓN Y ALCANCE DEL SISTEMA
   - Plataforma Cloud multitenant orientada al aprovisionamiento ágil de bases de datos relacionales PostgreSQL para el sector agrícola.
   - Objetivos de rendimiento, alta disponibilidad, particionamiento lógico y aislamiento por esquema.

2. ARQUITECTURA DE SOFTWARE
   - Frontend: SPA en React 19, Vite, TypeScript, Tailwind CSS v4.
   - Backend: API RESTful en Spring Boot 3.3 / Java 21, Spring Security con autenticación stateless basada en JWT.
   - Persistencia: PostgreSQL 16 con aislamiento Schema-per-Tenant.
   - Seguridad y Cifrado: Módulo de criptografía simétrica AES-256 en modo GCM con vector de inicialización (IV) único por credencial almacenada.

3. MODELO DE DATOS Y ENTIDADES PRINCIPALES
   - Entidades centrales: users, subscriptions, plans, db_instances, database_templates, payments, invoices, incidents, incident_comments.
   - Generación dinámica de esquemas para cada instancia contratada (inst_nombre_cliente).

4. CONTRATOS DE INTEGRACIÓN Y ENDPOINTS REST (/api/v1)
   - /auth: Autenticación, registro, recuperación y verificación de correo.
   - /instancias: Gestión del ciclo de vida de bases de datos, credenciales seguras y telemetría de recursos (CPU, RAM, disco).
   - /suscripciones: Manejo de planes (Finca, Productor, Enterprise), cambios de suscripción y cancelaciones.
   - /incidencias: Mesa de ayuda técnica y comunicación directa entre soporte y clientes.

5. REQUISITOS TÉCNICOS Y DESPLIEGUE
   - Entorno mínimo: JDK 21+, Node.js 20+, PostgreSQL 16+.
   - Variables de entorno obligatorias: DB_URL, JWT_SECRET, AES_ENCRYPTION_KEY.`,
    fecha: "2026-11-08",
    autor: "Equipo de Arquitectura e Ingeniería AgroCloud",
  },
  {
    id: "DOC-USR-002",
    titulo: "Manual de Usuario de AgroCloud",
    descripcion: "Guía completa de usuario para productores agrícolas, administradores y soporte: registro, contratación de planes, aprovisionamiento de bases de datos PostgreSQL, consulta de credenciales y mesa de ayuda.",
    categoria: "Manuales",
    destino: "todos",
    archivoNombre: "AgroCloud_Manual_Usuario.pdf",
    archivoTamano: "4.4 MB",
    archivoUrl: "/documentation/AgroCloud_Manual_Usuario.pdf",
    contenido: `CONTENIDO DEL MANUAL DE USUARIO:

1. INICIO Y GESTIÓN DE CUENTA
   - Creación de cuenta de productor agrícola y validación por correo electrónico.
   - Inicio de sesión y navegación por el Panel de Control.
   - Configuración de perfil y preferencias de apariencia (modo claro y oscuro).

2. PLANES DE SUSCRIPCIÓN Y PAGOS
   - Catálogo de planes: Plan Finca (10 GB), Plan Productor (50 GB) y Plan Agro Enterprise (250 GB).
   - Pasarela de pago simulada, generación de comprobantes y facturación electrónica.
   - Proceso para cambiar de plan o cancelar la suscripción activa.

3. ADMINISTRACIÓN DE BASES DE DATOS POSTGRESQL
   - Creación de una nueva instancia basada en plantillas agronómicas (cultivos, cosechas, maquinaria, sensores).
   - Visualización y copia segura de credenciales de conexión (Host, Puerto, Base de datos, Usuario, Contraseña).
   - Conexión externa mediante clientes SQL como DBeaver, pgAdmin y scripts en Python / Node.js.
   - Explorador de datos: inspección de tablas y registros generados.
   - Operaciones de reinicio seguro y eliminación con confirmación.

4. MESA DE AYUDA Y SOPORTE
   - Apertura de tickets de soporte técnico e incidencias.
   - Seguimiento del estado en tiempo real y chat con el equipo de soporte.
   - Preguntas frecuentes y solución de problemas comunes de conexión.`,
    fecha: "2026-11-08",
    autor: "Equipo de Soporte y Experiencia de Usuario AgroCloud",
  },
];
