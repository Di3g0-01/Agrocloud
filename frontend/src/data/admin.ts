import type { Usuario, ClienteAdmin, InstanciaAdmin, Suscripcion, PagoAdmin, PlantillaAdmin } from "../types/admin";

export const USUARIOS_DATA: Usuario[] = [
  { id: "U01", nombre: "Juan Pérez", correo: "juan@fincalospinos.com", rol: "Cliente", org: "Finca Los Pinos", estado: "Activo", registro: "12 jun 2026", acceso: "hace 2 h" },
  { id: "U02", nombre: "María López", correo: "maria@coopoccidente.com", rol: "Cliente", org: "Cooperativa Occidente", estado: "Activo", registro: "18 jun 2026", acceso: "hace 5 h" },
  { id: "U03", nombre: "Carlos Ramírez", correo: "carlos@fincaelroble.com", rol: "Cliente", org: "Finca El Roble", estado: "Activo", registro: "25 jun 2026", acceso: "hace 1 d" },
  { id: "U04", nombre: "Lucía Méndez", correo: "lucia@agrocloud.com", rol: "Soporte", org: "AgroCloud", estado: "Activo", registro: "01 ene 2026", acceso: "hace 10 min" },
  { id: "U05", nombre: "David Admin", correo: "admin@agrocloud.com", rol: "Administrador", org: "AgroCloud", estado: "Activo", registro: "01 ene 2026", acceso: "ahora" },
  { id: "U06", nombre: "Ana Castillo", correo: "ana@agroexport.com", rol: "Cliente", org: "Agro Export GT", estado: "Activo", registro: "02 jul 2026", acceso: "hace 3 d" },
  { id: "U07", nombre: "Roberto Fuentes", correo: "roberto@haciendasc.com", rol: "Cliente", org: "Hacienda Santa Cruz", estado: "Pendiente", registro: "08 sep 2026", acceso: "—" },
  { id: "U08", nombre: "Pedro Giron", correo: "pedro@agricolanorte.com", rol: "Cliente", org: "Agrícola Del Norte", estado: "Suspendido", registro: "15 mar 2026", acceso: "hace 20 d" },
];

export const CLIENTES_DATA: ClienteAdmin[] = [
  { id: "CL01", nombre: "Finca Los Pinos", tipo: "Finca", responsable: "Carlos López", correo: "carlos@fincalospinos.com", telefono: "+502 5555-1001", plan: "Productor", instancias: 2, suscripcion: "Activa", estado: "Activo", registro: "12 jun 2026", almacenamiento: "32 / 50 GB" },
  { id: "CL02", nombre: "Finca El Roble", tipo: "Finca", responsable: "Andrea Morales", correo: "andrea@fincaelroble.com", telefono: "+502 5555-1002", plan: "Productor", instancias: 1, suscripcion: "Activa", estado: "Activo", registro: "25 jun 2026", almacenamiento: "10 / 50 GB" },
  { id: "CL03", nombre: "Cooperativa Occidente", tipo: "Cooperativa", responsable: "José Ramírez", correo: "jose@coopoccidente.com", telefono: "+502 5555-1003", plan: "Agro Pro", instancias: 3, suscripcion: "Activa", estado: "Activo", registro: "18 jun 2026", almacenamiento: "65 / 100 GB" },
  { id: "CL04", nombre: "Agro Export GT", tipo: "Empresa agroindustrial", responsable: "Luis Castillo", correo: "luis@agroexport.com", telefono: "+502 5555-1004", plan: "Agro Enterprise", instancias: 5, suscripcion: "Activa", estado: "Activo", registro: "02 jul 2026", almacenamiento: "180 / 250 GB" },
  { id: "CL05", nombre: "Hacienda Santa Cruz", tipo: "Finca", responsable: "Marta Cifuentes", correo: "marta@haciendasc.com", telefono: "+502 5555-1005", plan: "Finca", instancias: 1, suscripcion: "Activa", estado: "Activo", registro: "10 ago 2026", almacenamiento: "5 / 10 GB" },
  { id: "CL06", nombre: "Agrícola Del Norte", tipo: "Empresa agroindustrial", responsable: "Raúl Mendoza", correo: "raul@agricolanorte.com", telefono: "+502 5555-1006", plan: "Agro Pro", instancias: 2, suscripcion: "Activa", estado: "Activo", registro: "15 ago 2026", almacenamiento: "41 / 100 GB" },
  { id: "CL07", nombre: "Café Export S.A.", tipo: "Empresa agroindustrial", responsable: "Diana Pérez", correo: "diana@cafeexport.com", telefono: "+502 5555-1007", plan: "Productor", instancias: 1, suscripcion: "Suspendida", estado: "Suspendido", registro: "20 ene 2026", almacenamiento: "0 / 50 GB" },
];

export const INSTANCIAS_ADMIN: InstanciaAdmin[] = [
  { id: "I01", nombre: "agro-produccion-db", cliente: "Finca Los Pinos", plantilla: "Cosechas y producción", plan: "Productor", almacenamiento: "22 / 50 GB", estado: "Activa", creada: "28 ago 2026", cpu: 78, ram: 62, conexiones: 14 },
  { id: "I02", nombre: "agro-inventario-db", cliente: "Finca El Roble", plantilla: "Control de inventarios", plan: "Productor", almacenamiento: "10 / 50 GB", estado: "Detenida", creada: "30 ago 2026", cpu: 0, ram: 0, conexiones: 0 },
  { id: "I03", nombre: "coop-occidente-db", cliente: "Cooperativa Occidente", plantilla: "Cultivos y parcelas", plan: "Agro Pro", almacenamiento: "45 / 100 GB", estado: "Activa", creada: "31 ago 2026", cpu: 34, ram: 45, conexiones: 8 },
  { id: "I04", nombre: "santa-cruz-db", cliente: "Hacienda Santa Cruz", plantilla: "Gestión de trabajadores", plan: "Finca", almacenamiento: "5 / 10 GB", estado: "Activa", creada: "10 ago 2026", cpu: 22, ram: 38, conexiones: 3 },
  { id: "I05", nombre: "agricola-norte-db", cliente: "Agrícola Del Norte", plantilla: "Trazabilidad", plan: "Agro Pro", almacenamiento: "41 / 100 GB", estado: "Activa", creada: "15 ago 2026", cpu: 41, ram: 55, conexiones: 6 },
  { id: "I06", nombre: "cafe-export-db", cliente: "Café Export S.A.", plantilla: "Clientes y ventas", plan: "Productor", almacenamiento: "0 / 50 GB", estado: "Suspendida", creada: "20 ene 2026", cpu: 0, ram: 0, conexiones: 0 },
  { id: "I07", nombre: "agroexport-principal", cliente: "Agro Export GT", plantilla: "Cosechas y producción", plan: "Agro Enterprise", almacenamiento: "60 / 250 GB", estado: "Activa", creada: "02 jul 2026", cpu: 55, ram: 48, conexiones: 22 },
];

export const SUSCRIPCIONES_DATA: Suscripcion[] = [
  { id: "SUB-001", cliente: "Finca Los Pinos", plan: "Productor", precio: "Q60", inicio: "01/08/2026", renovacion: "01/10/2026", estado: "Activa" },
  { id: "SUB-002", cliente: "Finca El Roble", plan: "Productor", precio: "Q60", inicio: "15/08/2026", renovacion: "15/09/2026", estado: "Activa" },
  { id: "SUB-003", cliente: "Cooperativa Occidente", plan: "Agro Pro", precio: "Q120", inicio: "20/08/2026", renovacion: "20/09/2026", estado: "Activa" },
  { id: "SUB-004", cliente: "Agro Export GT", plan: "Agro Enterprise", precio: "Q250", inicio: "02/07/2026", renovacion: "02/10/2026", estado: "Activa" },
  { id: "SUB-005", cliente: "Hacienda Santa Cruz", plan: "Finca", precio: "Q25", inicio: "10/08/2026", renovacion: "10/09/2026", estado: "Activa" },
  { id: "SUB-006", cliente: "Agrícola Del Norte", plan: "Agro Pro", precio: "Q120", inicio: "15/07/2026", renovacion: "15/09/2026", estado: "Activa" },
  { id: "SUB-007", cliente: "Café Export S.A.", plan: "Productor", precio: "Q60", inicio: "20/01/2026", renovacion: "20/02/2026", estado: "Suspendida" },
  { id: "SUB-008", cliente: "Finca Las Margaritas", plan: "Finca", precio: "Q25", inicio: "01/06/2026", renovacion: "01/09/2026", estado: "Vencida" },
];

export const PAGOS_ADMIN: PagoAdmin[] = [
  { id: "PAY-1058", cliente: "Finca Los Pinos", concepto: "Plan Productor", monto: 60, metodo: "Tarjeta", fecha: "29 ago 2026", estado: "Pagado" },
  { id: "PAY-1057", cliente: "Cooperativa Occidente", concepto: "Plan Agro Pro", monto: 120, metodo: "Tarjeta", fecha: "28 ago 2026", estado: "Pagado" },
  { id: "PAY-1056", cliente: "Finca El Roble", concepto: "Plan Productor", monto: 60, metodo: "Transferencia", fecha: "27 ago 2026", estado: "Pendiente" },
  { id: "PAY-1055", cliente: "Agro Export GT", concepto: "Plan Agro Enterprise", monto: 250, metodo: "Tarjeta", fecha: "26 ago 2026", estado: "Pagado" },
  { id: "PAY-1054", cliente: "Hacienda Santa Cruz", concepto: "Plan Finca", monto: 25, metodo: "Transferencia", fecha: "25 ago 2026", estado: "Pagado" },
  { id: "PAY-1053", cliente: "Agrícola Del Norte", concepto: "Plan Agro Pro", monto: 120, metodo: "Tarjeta", fecha: "24 ago 2026", estado: "Pagado" },
  { id: "PAY-1052", cliente: "Café Export S.A.", concepto: "Plan Productor", monto: 60, metodo: "Tarjeta", fecha: "20 ago 2026", estado: "Rechazado" },
];

export const MESES_INGRESOS = [
  { mes: "Abr", monto: 1820 },
  { mes: "May", monto: 2050 },
  { mes: "Jun", monto: 1950 },
  { mes: "Jul", monto: 2310 },
  { mes: "Ago", monto: 2510 },
  { mes: "Sep", monto: 2180 },
];

export const PLANTILLAS_ADMIN: PlantillaAdmin[] = [
  { id: "TPL-01", nombre: "Cultivos y parcelas", descripcion: "Estructura PostgreSQL para gestionar cultivos, parcelas, ciclos productivos y terrenos.", tablas: 12, version: "1.2", instancias: 8, estado: "Activa", actualizada: "01 sep 2026", schema: ["cultivos", "parcelas", "ciclos_productivos", "terrenos", "insumos", "labores", "costos", "trabajadores", "maquinaria", "proveedores", "clientes", "reportes"] },
  { id: "TPL-02", nombre: "Cosechas y producción", descripcion: "Base de datos para registrar cosechas, producción agrícola y rendimiento.", tablas: 14, version: "1.4", instancias: 12, estado: "Activa", actualizada: "05 sep 2026", schema: ["cosechas", "producciones", "cultivos", "parcelas", "productos", "trabajadores", "maquinaria", "calidad", "empaque", "almacenamiento", "destinos", "rendimientos", "temporadas", "reportes"] },
  { id: "TPL-03", nombre: "Control de inventarios", descripcion: "Gestión de productos, insumos, existencias y movimientos de inventario.", tablas: 10, version: "1.3", instancias: 7, estado: "Activa", actualizada: "03 sep 2026", schema: ["productos", "insumos", "existencias", "movimientos", "bodegas", "proveedores", "pedidos", "categorias", "unidades", "reportes"] },
  { id: "TPL-04", nombre: "Gestión de trabajadores", descripcion: "Administración de trabajadores, puestos, jornadas y actividades agrícolas.", tablas: 11, version: "1.1", instancias: 5, estado: "Activa", actualizada: "28 ago 2026", schema: ["trabajadores", "puestos", "jornadas", "actividades", "pagos", "deducciones", "prestaciones", "contratos", "asistencias", "parcelas", "reportes"] },
  { id: "TPL-05", nombre: "Maquinaria", descripcion: "Administración de maquinaria agrícola, mantenimientos y utilización.", tablas: 9, version: "1.0", instancias: 3, estado: "Activa", actualizada: "20 ago 2026", schema: ["maquinas", "mantenimientos", "operadores", "combustible", "reparaciones", "parcelas", "registros", "costos", "reportes"] },
  { id: "TPL-06", nombre: "Proveedores", descripcion: "Gestión de proveedores, productos, pedidos y compras.", tablas: 8, version: "1.1", instancias: 4, estado: "Activa", actualizada: "22 ago 2026", schema: ["proveedores", "productos", "pedidos", "compras", "pagos", "categorias", "contactos", "reportes"] },
  { id: "TPL-07", nombre: "Clientes y ventas", descripcion: "Gestión comercial de clientes, pedidos, ventas y facturación.", tablas: 10, version: "1.2", instancias: 6, estado: "Activa", actualizada: "25 ago 2026", schema: ["clientes", "pedidos", "ventas", "facturas", "productos", "pagos", "descuentos", "contactos", "rutas", "reportes"] },
];
