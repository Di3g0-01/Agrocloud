import type { CInstancia, CPlantillaDB, Pago, Ticket } from "../types/cliente";

export const C_PLAN = { nombre: "Productor", maxInstancias: 2, totalGB: 50 };

export const C_INSTANCIAS: CInstancia[] = [
  {
    nombre: "agro-produccion-db",
    plantilla: "Cosechas y producción",
    usadoGB: 22,
    totalGB: 50,
    estado: "Activa",
    creada: "2026-08-15",
    version: "PostgreSQL 15.4",
    host: "agro-produccion-db.agrocloud.io",
    puerto: "5432",
    baseDatos: "agro_produccion",
    usuario: "fp_admin",
    password: "s3cur3P@ss!",
    cpu: 45,
    memoria: 62,
    actividad: [
      { desc: "Conexión establecida", tiempo: "hace 5 min", tipo: "ok" },
      { desc: "Backup automático completado", tiempo: "hace 2 h", tipo: "ok" },
      { desc: "Pico de CPU detectado (78%)", tiempo: "hace 4 h", tipo: "warn" },
      { desc: "Instancia iniciada", tiempo: "2026-08-15", tipo: "info" },
    ],
  },
  {
    nombre: "agro-inventario-db",
    plantilla: "Control de inventarios",
    usadoGB: 10,
    totalGB: 50,
    estado: "Reiniciando",
    creada: "2026-08-30",
    version: "PostgreSQL 15.4",
    host: "agro-inventario-db.agrocloud.io",
    puerto: "5432",
    baseDatos: "agro_inventario",
    usuario: "fp_admin",
    password: "h8dKz#2mP!",
    cpu: 0,
    memoria: 0,
    actividad: [
      { desc: "Reinicio en progreso", tiempo: "hace 3 min", tipo: "warn" },
      { desc: "Incidencia registrada: INC-023", tiempo: "hace 1 h", tipo: "warn" },
      { desc: "Backup completado", tiempo: "hace 6 h", tipo: "ok" },
      { desc: "Instancia creada", tiempo: "2026-08-30", tipo: "info" },
    ],
  },
];

export const C_PLANTILLAS: CPlantillaDB[] = [
  {
    id: "TPL-001",
    nombre: "Cultivos y parcelas",
    categoria: "Producción",
    descripcion: "Schema para gestionar parcelas, ciclos de cultivo y actividades agrícolas por temporada.",
    tablas: 12,
    entidades: ["Parcelas", "Cultivos", "Ciclos", "Actividades", "Insumos", "Rendimientos"],
    casosDeUso: ["Registro de parcelas georreferenciadas", "Seguimiento de ciclos de cultivo", "Control de insumos aplicados"],
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  },
  {
    id: "TPL-002",
    nombre: "Cosechas y producción",
    categoria: "Producción",
    descripcion: "Registro de volúmenes cosechados, calidad del producto y trazabilidad por lote de exportación.",
    tablas: 10,
    entidades: ["Cosechas", "Lotes", "Calidad", "Destinos", "Transportes", "Registro"],
    casosDeUso: ["Trazabilidad de cosecha a destino", "Control de calidad por lote", "Reportes de producción"],
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    id: "TPL-003",
    nombre: "Control de inventarios",
    categoria: "Operaciones",
    descripcion: "Entradas, salidas y movimientos de insumos, materiales y productos terminados en bodega.",
    tablas: 9,
    entidades: ["Productos", "Bodegas", "Entradas", "Salidas", "Ajustes", "Proveedores"],
    casosDeUso: ["Control de stock en tiempo real", "Alertas de inventario mínimo", "Trazabilidad de insumos"],
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    id: "TPL-004",
    nombre: "Gestión de trabajadores",
    categoria: "Recursos Humanos",
    descripcion: "Personal, asistencia, planillas salariales y asignación de tareas agrícolas por área.",
    tablas: 11,
    entidades: ["Empleados", "Áreas", "Asistencia", "Tareas", "Planillas", "Contratos"],
    casosDeUso: ["Control de asistencia diaria", "Generación de planillas", "Asignación de labores por área"],
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    id: "TPL-005",
    nombre: "Maquinaria",
    categoria: "Activos",
    descripcion: "Registro de equipos agrícolas, programación de mantenimientos, consumo de combustible y horómetros.",
    tablas: 8,
    entidades: ["Equipos", "Mantenimientos", "Combustible", "Operadores", "Fallas", "Repuestos"],
    casosDeUso: ["Control de horómetros y kilometraje", "Programación de mantenimientos", "Historial de fallas"],
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
  },
  {
    id: "TPL-006",
    nombre: "Proveedores",
    categoria: "Comercial",
    descripcion: "Catálogo de proveedores agrícolas, órdenes de compra, facturas y evaluación de servicio.",
    tablas: 7,
    entidades: ["Proveedores", "Órdenes", "Facturas", "Productos", "Evaluaciones", "Pagos"],
    casosDeUso: ["Gestión de órdenes de compra", "Evaluación periódica de proveedores", "Control de pagos pendientes"],
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    id: "TPL-007",
    nombre: "Clientes y ventas",
    categoria: "Comercial",
    descripcion: "CRM agrícola con gestión de clientes, pedidos de cosecha, precios y seguimiento comercial.",
    tablas: 10,
    entidades: ["Clientes", "Pedidos", "Precios", "Entregas", "Facturación", "Seguimiento"],
    casosDeUso: ["Registro y segmentación de clientes", "Gestión de pedidos y entregas", "Facturación y seguimiento comercial"],
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  },
];

export const PAGOS_MOCK: Pago[] = [
  { id: "PAG-006", fecha: "9 de septiembre 2026", concepto: "Plan Productor", periodo: "sep 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260901-8821", estado: "Pagado" },
  { id: "PAG-005", fecha: "2026-08-01", concepto: "Plan Productor", periodo: "ago 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260801-7714", estado: "Pagado" },
  { id: "PAG-004", fecha: "2026-07-01", concepto: "Plan Productor", periodo: "jul 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260701-6603", estado: "Pagado" },
  { id: "PAG-003", fecha: "2026-06-01", concepto: "Plan Productor", periodo: "jun 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260601-5541", estado: "Pagado" },
  { id: "PAG-002", fecha: "2026-05-01", concepto: "Plan Productor", periodo: "may 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260501-4430", estado: "Pagado" },
  { id: "PAG-001", fecha: "2026-04-01", concepto: "Plan Productor", periodo: "abr 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260401-3319", estado: "Pagado" },
];

export const TICKETS_INIT: Ticket[] = [
  {
    id: "INC-024", asunto: "Problema de conexión en producción", instancia: "agro-produccion-db",
    categoria: "Conectividad", prioridad: "Alta", estado: "En proceso",
    descripcion: "La instancia no responde a las consultas de producción desde las 08:00 hrs del 5 sep.",
    creado: "2026-09-05", actualizado: "2026-09-05",
    historial: [
      { autor: "cliente", texto: "La instancia no responde desde las 08:00. Necesito solución urgente.", fecha: "2026-09-05 08:15" },
      { autor: "soporte", texto: "Hemos recibido tu reporte. El equipo técnico está revisando la conectividad de red.", fecha: "2026-09-05 09:02" },
    ],
  },
  {
    id: "INC-019", asunto: "Error al importar datos desde CSV", instancia: "agro-inventario-db",
    categoria: "Datos", prioridad: "Media", estado: "Resuelta",
    descripcion: "Al importar el archivo de inventario en formato CSV, el sistema arroja un error de codificación UTF-8.",
    creado: "2026-08-22", actualizado: "2026-08-24",
    historial: [
      { autor: "cliente", texto: "El CSV importado genera error de codificación y no carga los registros.", fecha: "2026-08-22 10:30" },
      { autor: "soporte", texto: "Revisamos el archivo. El problema es la codificación del CSV. Deben exportarlo en UTF-8.", fecha: "2026-08-23 14:00" },
      { autor: "cliente", texto: "Listo, se corrigió la codificación y el importador funciona bien.", fecha: "2026-08-24 09:10" },
      { autor: "soporte", texto: "Perfecto. Marcamos el ticket como resuelto. Queda disponible para tu seguimiento.", fecha: "2026-08-24 09:30" },
    ],
  },
  {
    id: "INC-015", asunto: "Consultas lentas en hora pico", instancia: "agro-produccion-db",
    categoria: "Rendimiento", prioridad: "Media", estado: "Resuelta",
    descripcion: "Entre las 12:00 y 14:00 hrs las consultas de reporte tardan más de 30 segundos.",
    creado: "2026-08-10", actualizado: "2026-08-12",
    historial: [
      { autor: "cliente", texto: "Las consultas de reporte son muy lentas al mediodía. Afecta la operación.", fecha: "2026-08-10 12:45" },
      { autor: "soporte", texto: "Identificamos consultas sin índice adecuado. Se optimizó el schema en la instancia.", fecha: "2026-08-12 11:00" },
    ],
  },
  {
    id: "INC-012", asunto: "Solicitud de aumento de almacenamiento", instancia: "agro-inventario-db",
    categoria: "Plan", prioridad: "Baja", estado: "Resuelta",
    descripcion: "Necesito información sobre cómo ampliar el almacenamiento de mi plan actual.",
    creado: "2026-07-28", actualizado: "2026-07-29",
    historial: [
      { autor: "cliente", texto: "¿Cómo puedo ampliar los 50 GB del plan?", fecha: "2026-07-28 16:00" },
      { autor: "soporte", texto: "Para aumentar el almacenamiento debes cambiar al plan Agro Pro. Te enviamos detalles por correo.", fecha: "2026-07-29 10:00" },
    ],
  },
];

