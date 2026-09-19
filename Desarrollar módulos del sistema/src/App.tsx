import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "landing" | "login" | "admin" | "cliente" | "soporte";
type AdminPage = "dashboard" | "usuarios" | "clientes" | "instancias" | "planes" | "suscripciones" | "pagos" | "plantillas" | "monitoreo" | "incidencias" | "configuracion" | "documentacion";
type ClientePage = "dashboard" | "instancias" | "plantillas" | "plan" | "pagos" | "soporte" | "configuracion" | "documentacion";
type SoportePage = "dashboard" | "incidencias" | "instancias" | "actividad" | "documentacion" | "configuracion";

interface Incident {
  id: string; cliente: string; instancia: string; plantilla: string; asunto: string;
  problema: string; prioridad: "Alta" | "Media" | "Baja"; estado: "Abierta" | "En revisión" | "Resuelta";
  fecha: string; guia: string;
}
interface Instance {
  nombre: string; cliente: string; tipo: string; estado: "Operativa" | "En revisión" | "Detenida";
  version: string; uptime: string; cpu: number; memoria: number; region: string;
}
interface ActivityLog {
  id: string; tipo: "asignada" | "revisada" | "actualizada" | "resuelta" | "abierta";
  descripcion: string; incidencia: string; tiempo: string;
}

// ─── Shared Data ─────────────────────────────────────────────────────────────

const incidents: Incident[] = [
  { id: "INC-024", cliente: "Finca Los Pinos", instancia: "agro-produccion-db", plantilla: "Cosechas y producción", asunto: "Problema de conexión", problema: "La instancia no responde a las consultas de producción desde las 08:00 hrs.", prioridad: "Alta", estado: "En revisión", fecha: "2026-09-05", guia: "Verificar conectividad de red y revisar logs del servidor de base de datos." },
  { id: "INC-023", cliente: "Finca El Roble", instancia: "agro-inventario-db", plantilla: "Control de inventarios", asunto: "Instancia detenida", problema: "El módulo de inventario dejó de funcionar tras la última actualización.", prioridad: "Media", estado: "Abierta", fecha: "2026-09-05", guia: "Revisar changelog de la última actualización y revertir si es necesario." },
  { id: "INC-022", cliente: "Cooperativa Occidente", instancia: "coop-occidente-db", plantilla: "Gestión financiera", asunto: "Error en reportes", problema: "Los reportes mensuales muestran valores negativos en el balance.", prioridad: "Alta", estado: "En revisión", fecha: "2026-09-04", guia: "Validar las fórmulas de cálculo en el módulo de reportes financieros." },
  { id: "INC-021", cliente: "Hacienda Santa Cruz", instancia: "santa-cruz-db", plantilla: "Gestión de personal", asunto: "Acceso denegado", problema: "Varios usuarios reportan que no pueden acceder al sistema.", prioridad: "Baja", estado: "Resuelta", fecha: "2026-09-03", guia: "Restablecer permisos de usuario y verificar políticas de contraseñas." },
  { id: "INC-020", cliente: "Agrícola Del Norte", instancia: "agricola-norte-db", plantilla: "Trazabilidad", asunto: "Datos duplicados", problema: "El sistema genera registros duplicados al importar datos desde móviles.", prioridad: "Media", estado: "Resuelta", fecha: "2026-09-02", guia: "Revisar el proceso de sincronización móvil y agregar validación de duplicados." },
];

const instances: Instance[] = [
  { nombre: "agro-produccion-db", cliente: "Finca Los Pinos", tipo: "PostgreSQL", estado: "En revisión", version: "v3.2.1", uptime: "99.1%", cpu: 78, memoria: 62, region: "us-east-1" },
  { nombre: "agro-inventario-db", cliente: "Finca El Roble", tipo: "PostgreSQL", estado: "Detenida", version: "v3.1.8", uptime: "0%", cpu: 0, memoria: 0, region: "us-east-1" },
  { nombre: "coop-occidente-db", cliente: "Coop. Occidente", tipo: "PostgreSQL", estado: "Operativa", version: "v3.2.1", uptime: "99.9%", cpu: 34, memoria: 45, region: "us-west-2" },
  { nombre: "santa-cruz-db", cliente: "Hacienda Santa Cruz", tipo: "PostgreSQL", estado: "Operativa", version: "v3.0.5", uptime: "99.7%", cpu: 22, memoria: 38, region: "us-east-1" },
  { nombre: "agricola-norte-db", cliente: "Agrícola Del Norte", tipo: "PostgreSQL", estado: "Operativa", version: "v3.2.0", uptime: "99.8%", cpu: 41, memoria: 55, region: "eu-west-1" },
  { nombre: "cafe-export-db", cliente: "Café Export S.A.", tipo: "PostgreSQL", estado: "Detenida", version: "v3.2.1", uptime: "0%", cpu: 0, memoria: 0, region: "us-east-1" },
];

const activityLogs: ActivityLog[] = [
  { id: "1", tipo: "asignada", descripcion: "Incidencia asignada a soporte técnico", incidencia: "INC-024", tiempo: "hace 6 min" },
  { id: "2", tipo: "revisada", descripcion: "Instancia revisada y monitoreada", incidencia: "agro-produccion-db", tiempo: "hace 24 min" },
  { id: "3", tipo: "actualizada", descripcion: "Estado actualizado a En revisión", incidencia: "INC-023", tiempo: "hace 1 h" },
  { id: "4", tipo: "resuelta", descripcion: "Incidencia resuelta exitosamente", incidencia: "INC-021", tiempo: "hace 2 h" },
  { id: "5", tipo: "abierta", descripcion: "Nueva incidencia registrada", incidencia: "INC-022", tiempo: "hace 3 h" },
  { id: "6", tipo: "abierta", descripcion: "Instancia suspendida por inactividad", incidencia: "cafe-export-db", tiempo: "hace 5 h" },
];

const templates = ["Cultivos y parcelas", "Cosechas y producción", "Control de inventarios", "Gestión de trabajadores", "Maquinaria", "Proveedores", "Clientes y ventas"];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function PriorityBadge({ p }: { p: Incident["prioridad"] }) {
  const cls = p === "Alta" ? "bg-red-50 text-red-600 border border-red-200" : p === "Media" ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-green-50 text-green-700 border border-green-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{p}</span>;
}

function StatusBadge({ s }: { s: string }) {
  const cls = s === "Resuelta" || s === "Operativa" || s === "Activa" || s === "ACTIVA" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : s === "En revisión" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : s === "Abierta" ? "bg-blue-50 text-blue-600 border border-blue-200"
    : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>;
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function ActivityIcon({ tipo }: { tipo: ActivityLog["tipo"] }) {
  if (tipo === "asignada") return <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div>;
  if (tipo === "resuelta") return <div className="w-7 h-7 rounded-full bg-lime-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>;
  if (tipo === "revisada") return <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h8m-8 5h16" /></svg></div>;
  if (tipo === "abierta") return <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg></div>;
  return <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>;
}

// Logo icon
function LogoIcon({ size = 8 }: { size?: number }) {
  return (
    <div className={`w-${size} h-${size} rounded-lg bg-lime-400 flex items-center justify-center shrink-0`}>
      <svg className={`w-${size === 8 ? 5 : 4} h-${size === 8 ? 5 : 4} text-gray-900`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-8">
        <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
        <span className="text-xl font-semibold text-gray-900">AgroCloud</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h1>
        <p className="text-sm text-gray-500 mb-6">Accede a tu infraestructura de bases de datos.</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Correo electrónico</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700">Contraseña</label>
              <button className="text-xs text-gray-500 hover:text-gray-700">¿Olvidaste tu contraseña?</button>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Demo role buttons */}
        <div className="space-y-2 mb-4">
          <button onClick={() => onLogin("admin")} className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-sm transition-colors">
            Iniciar sesión
          </button>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-left text-xs text-gray-400 mb-3">Acceso de demostración</p>
          <div className="grid grid-cols-3 gap-2">
            {([["admin", "Administrador"], ["cliente", "Cliente"], ["soporte", "Soporte"]] as const).map(([role, label]) => (
              <button key={role} onClick={() => onLogin(role)} className="py-2 border border-gray-200 hover:border-lime-400 hover:bg-lime-50 rounded-xl text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-left text-xs text-gray-400 mt-5">
          ¿No tienes una cuenta? <button className="text-gray-700 font-medium hover:underline">Regístrate</button>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-6">Acceso seguro a tu cuenta de AgroCloud.</p>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

const adminNav = [
  { page: "dashboard" as AdminPage, label: "Dashboard", section: "PRINCIPAL", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { page: "usuarios" as AdminPage, label: "Usuarios", section: "GESTIÓN", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { page: "clientes" as AdminPage, label: "Clientes", section: null, icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { page: "instancias" as AdminPage, label: "Instancias", section: null, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { page: "planes" as AdminPage, label: "Planes", section: null, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { page: "suscripciones" as AdminPage, label: "Suscripciones", section: null, icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { page: "pagos" as AdminPage, label: "Pagos", section: null, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { page: "plantillas" as AdminPage, label: "Plantillas DB", section: "PLATAFORMA", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { page: "monitoreo" as AdminPage, label: "Monitoreo", section: null, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { page: "incidencias" as AdminPage, label: "Incidencias", section: null, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { page: "configuracion" as AdminPage, label: "Configuración", section: "SISTEMA", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { page: "documentacion" as AdminPage, label: "Documentación", section: null, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

function AdminSidebar({ page, setPage, onLogout, open, onClose }: { page: AdminPage; setPage: (p: AdminPage) => void; onLogout: () => void; open: boolean; onClose: () => void }) {
  const navigate = (p: AdminPage) => { setPage(p); onClose(); };
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-52 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 lg:shrink-0 ${open ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "#0e1a0c" }}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <LogoIcon />
          <span className="text-white font-semibold text-sm flex-1">AgroCloud</span>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          {adminNav.map((item) => (
            <div key={item.page}>
              {item.section && <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-2 pt-4 pb-1.5">{item.section}</p>}
              <button onClick={() => navigate(item.page)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === item.page ? "bg-lime-400 text-gray-900" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {item.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}
                </svg>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-semibold shrink-0">DA</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">David Administrador</p>
              <p className="text-white/40 text-[10px]">Administrador</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-lime-400" /><span className="text-[10px] text-white/40">Plataforma operativa</span></div>
            <button onClick={onLogout} className="text-[10px] text-white/30 hover:text-white/60">Salir</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function AdminDashboard() {
  const adminActivity = [
    { dot: "bg-lime-500", title: "Nueva instancia creada", sub: "Cooperativa Occidente" },
    { dot: "bg-blue-400", title: "Nuevo usuario registrado", sub: "Hace 3 horas" },
    { dot: "bg-lime-500", title: "Suscripción renovada", sub: "Finca Los Pinos" },
    { dot: "bg-red-400", title: "Incidencia abierta", sub: "INC-024 · Alta" },
    { dot: "bg-gray-400", title: "Instancia suspendida", sub: "cafe-export-db" },
  ];
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Panel administrativo</h1>
          <p className="text-sm text-gray-500 mt-1">Supervisa la actividad general y el estado operativo de AgroCloud.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium px-3 lg:px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva plantilla</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "USUARIOS", value: "52", sub: "Usuarios registrados", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-500 bg-blue-50" },
          { label: "INSTANCIAS", value: "38", sub: "Instancias activas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-lime-600 bg-lime-50" },
          { label: "SUSCRIPCIONES", value: "31", sub: "Suscripciones activas", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-500 bg-purple-50" },
          { label: "INCIDENCIAS", value: "5", sub: "Incidencias abiertas", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: "text-orange-500 bg-orange-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Instancias recientes</h2>
              <p className="text-xs text-gray-400 mt-0.5">Vista global de los servicios creados recientemente.</p>
            </div>
            <button className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Ver todas</button>
          </div>
          <table className="w-full min-w-max text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                {["Nombre", "Cliente", "Plantilla", "Plan", "Estado", "Creada"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium uppercase tracking-wide text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { nombre: "agro-produccion-db", cliente: "Finca Los Pinos", plantilla: "Cosechas y producción", plan: "Productor", estado: "Activa", fecha: "28 ago 2026" },
                { nombre: "agro-inventario-db", cliente: "Finca El Roble", plantilla: "Control de inventarios", plan: "Productor", estado: "Activa", fecha: "30 ago 2026" },
                { nombre: "coop-occidente-db", cliente: "Coop. Occidente", plantilla: "Cultivos y parcelas", plan: "Agro Pro", estado: "Activa", fecha: "31 ago 2026" },
              ].map(row => (
                <tr key={row.nombre} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-mono font-medium text-gray-900">{row.nombre}</td>
                  <td className="px-5 py-4 text-gray-600">{row.cliente}</td>
                  <td className="px-5 py-4 text-gray-600">{row.plantilla}</td>
                  <td className="px-5 py-4 text-gray-500">{row.plan}</td>
                  <td className="px-5 py-4"><StatusBadge s={row.estado} /></td>
                  <td className="px-5 py-4 text-gray-400">{row.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          </div>
          <div className="p-5 space-y-4">
            {adminActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
                <div>
                  <p className="text-xs text-gray-800 font-medium">{a.title}</p>
                  <p className="text-[10px] text-gray-400">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Plantillas de bases de datos</h2>
            <p className="text-xs text-gray-400 mt-0.5">Schemas agrícolas disponibles en la plataforma.</p>
          </div>
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Gestionar plantillas</button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-lime-300 hover:bg-lime-50 transition-colors cursor-pointer">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminMonitoreo() {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Monitoreo</h1>
        <p className="text-sm text-gray-500 mt-1">Estado en tiempo real de todas las instancias del sistema.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[{ label: "Operativas", count: 4, color: "text-lime-600 bg-lime-50 border-lime-200" }, { label: "En revisión", count: 1, color: "text-amber-600 bg-amber-50 border-amber-200" }, { label: "Detenidas", count: 2, color: "text-red-600 bg-red-50 border-red-200" }].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}><span className="text-3xl font-semibold">{count}</span><span className="text-sm font-medium">{label}</span></div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{["Instancia", "Cliente", "CPU", "Memoria", "Uptime", "Estado"].map(h => <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody>
            {instances.map(inst => (
              <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-medium text-gray-900">{inst.nombre}</td>
                <td className="px-5 py-4 text-gray-600">{inst.cliente}</td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className="text-xs text-gray-500 w-8 shrink-0">{inst.cpu}%</span></div></td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className="text-xs text-gray-500 w-8 shrink-0">{inst.memoria}%</span></div></td>
                <td className="px-5 py-4 text-gray-500 text-xs">{inst.uptime}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-12 flex flex-col items-start justify-center text-left">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <p className="text-gray-400 text-sm">Módulo en construcción</p>
      </div>
    </div>
  );
}

function AdminIncidencias() {
  const [selected, setSelected] = useState<Incident | null>(null);
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-8">
        <div><h1 className="text-2xl font-semibold text-gray-900">Incidencias</h1><p className="text-sm text-gray-500 mt-1">Gestión global de incidencias de todos los clientes.</p></div>
      </div>
      <div className="flex gap-6">
        <div className="flex-1 bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">{["ID", "Cliente", "Instancia", "Asunto", "Prioridad", "Estado", "Fecha"].map(h => <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{incidents.map(inc => (
              <tr key={inc.id} onClick={() => setSelected(selected?.id === inc.id ? null : inc)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selected?.id === inc.id ? "bg-lime-50" : "hover:bg-gray-50"}`}>
                <td className="px-5 py-4 font-medium text-gray-900">{inc.id}</td>
                <td className="px-5 py-4 text-gray-700">{inc.cliente}</td>
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">{inc.instancia}</td>
                <td className="px-5 py-4 text-gray-700">{inc.asunto}</td>
                <td className="px-5 py-4"><PriorityBadge p={inc.prioridad} /></td>
                <td className="px-5 py-4"><StatusBadge s={inc.estado} /></td>
                <td className="px-5 py-4 text-gray-400 text-xs">{inc.fecha}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {selected && (
          <div className="w-72 bg-white border border-gray-100 rounded-xl p-5 self-start shrink-0">
            <div className="flex justify-between mb-4"><span className="font-mono font-semibold text-sm">{selected.id}</span><button onClick={() => setSelected(null)} className="text-gray-400">✕</button></div>
            <div className="space-y-3">
              {[["Cliente", selected.cliente], ["Instancia", selected.instancia], ["Asunto", selected.asunto]].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="text-sm text-gray-800">{v}</p></div>
              ))}
              <div><p className="text-xs text-gray-400 mb-0.5">Problema</p><p className="text-sm text-gray-600 leading-relaxed">{selected.problema}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Guía</p><p className="text-sm text-gray-600 leading-relaxed bg-lime-50 border border-lime-100 rounded-lg p-3">{selected.guia}</p></div>
              <div className="flex gap-2"><PriorityBadge p={selected.prioridad} /><StatusBadge s={selected.estado} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ADMIN: Usuarios ─────────────────────────────────────────────────────────

type UsuarioRol = "Cliente" | "Soporte" | "Administrador";
type UsuarioEstado = "Activo" | "Pendiente" | "Suspendido";

interface Usuario {
  id: string; nombre: string; correo: string; rol: UsuarioRol; org: string;
  estado: UsuarioEstado; registro: string; acceso: string;
}

const USUARIOS_DATA: Usuario[] = [
  { id: "U01", nombre: "Juan Pérez", correo: "juan@fincalospinos.com", rol: "Cliente", org: "Finca Los Pinos", estado: "Activo", registro: "12 jun 2026", acceso: "hace 2 h" },
  { id: "U02", nombre: "María López", correo: "maria@coopoccidente.com", rol: "Cliente", org: "Cooperativa Occidente", estado: "Activo", registro: "18 jun 2026", acceso: "hace 5 h" },
  { id: "U03", nombre: "Carlos Ramírez", correo: "carlos@fincaelroble.com", rol: "Cliente", org: "Finca El Roble", estado: "Activo", registro: "25 jun 2026", acceso: "hace 1 d" },
  { id: "U04", nombre: "Lucía Méndez", correo: "lucia@agrocloud.com", rol: "Soporte", org: "AgroCloud", estado: "Activo", registro: "01 ene 2026", acceso: "hace 10 min" },
  { id: "U05", nombre: "David Admin", correo: "admin@agrocloud.com", rol: "Administrador", org: "AgroCloud", estado: "Activo", registro: "01 ene 2026", acceso: "ahora" },
  { id: "U06", nombre: "Ana Castillo", correo: "ana@agroexport.com", rol: "Cliente", org: "Agro Export GT", estado: "Activo", registro: "02 jul 2026", acceso: "hace 3 d" },
  { id: "U07", nombre: "Roberto Fuentes", correo: "roberto@haciendasc.com", rol: "Cliente", org: "Hacienda Santa Cruz", estado: "Pendiente", registro: "08 sep 2026", acceso: "—" },
  { id: "U08", nombre: "Pedro Giron", correo: "pedro@agricolanorte.com", rol: "Cliente", org: "Agrícola Del Norte", estado: "Suspendido", registro: "15 mar 2026", acceso: "hace 20 d" },
];

function UsuarioBadge({ estado }: { estado: UsuarioEstado }) {
  const cls = estado === "Activo" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : estado === "Pendiente" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{estado}</span>;
}

function RolBadge({ rol }: { rol: UsuarioRol }) {
  const cls = rol === "Administrador" ? "bg-purple-50 text-purple-700 border border-purple-200"
    : rol === "Soporte" ? "bg-blue-50 text-blue-600 border border-blue-200"
    : "bg-gray-100 text-gray-600 border border-gray-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{rol}</span>;
}

function AdminUsuarios() {
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState("Todos");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = USUARIOS_DATA.filter(u =>
    (rolFilter === "Todos" || u.rol === rolFilter) &&
    (estadoFilter === "Todos" || u.estado === estadoFilter) &&
    (u.nombre.toLowerCase().includes(search.toLowerCase()) || u.correo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de usuarios de la plataforma AgroCloud.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nuevo usuario</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL USUARIOS", value: "52", sub: "Usuarios registrados", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", color: "text-blue-500 bg-blue-50" },
          { label: "USUARIOS ACTIVOS", value: "45", sub: "Con acceso activo", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
          { label: "ADMINISTRADORES", value: "3", sub: "Con acceso total", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-500 bg-purple-50" },
          { label: "SUSPENDIDOS", value: "4", sub: "Acceso restringido", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636", color: "text-red-500 bg-red-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuario..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <select value={rolFilter} onChange={e => setRolFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Cliente", "Soporte", "Administrador"].map(r => <option key={r}>{r}</option>)}
        </select>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Activo", "Pendiente", "Suspendido"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Usuario", "Correo", "Rol", "Organización", "Estado", "Registro", "Último acceso", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">{u.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                    <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{u.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{u.correo}</td>
                <td className="px-5 py-4"><RolBadge rol={u.rol} /></td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{u.org}</td>
                <td className="px-5 py-4"><UsuarioBadge estado={u.estado} /></td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{u.registro}</td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{u.acceso}</td>
                <td className="px-5 py-4 relative">
                  <button onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === u.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver usuario", "Editar", "Cambiar rol", "Suspender", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => setMenuOpen(null)} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i === 4 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} usuario{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Nuevo usuario</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nombre completo", placeholder: "Ej. Juan Pérez", type: "text" },
                { label: "Correo electrónico", placeholder: "correo@empresa.com", type: "email" },
                { label: "Contraseña temporal", placeholder: "••••••••", type: "password" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Rol</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white">
                    {["Cliente", "Soporte", "Administrador"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Estado</label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white">
                    {["Activo", "Pendiente", "Suspendido"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Organización</label>
                <input type="text" placeholder="Nombre de la organización" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold transition-colors">Crear usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: Clientes ──────────────────────────────────────────────────────────

interface ClienteAdmin {
  id: string; nombre: string; tipo: string; responsable: string; correo: string; telefono: string;
  plan: string; instancias: number; suscripcion: string; estado: string; registro: string; almacenamiento: string;
}

const CLIENTES_DATA: ClienteAdmin[] = [
  { id: "CL01", nombre: "Finca Los Pinos", tipo: "Finca", responsable: "Carlos López", correo: "carlos@fincalospinos.com", telefono: "+502 5555-1001", plan: "Productor", instancias: 2, suscripcion: "Activa", estado: "Activo", registro: "12 jun 2026", almacenamiento: "32 / 50 GB" },
  { id: "CL02", nombre: "Finca El Roble", tipo: "Finca", responsable: "Andrea Morales", correo: "andrea@fincaelroble.com", telefono: "+502 5555-1002", plan: "Productor", instancias: 1, suscripcion: "Activa", estado: "Activo", registro: "25 jun 2026", almacenamiento: "10 / 50 GB" },
  { id: "CL03", nombre: "Cooperativa Occidente", tipo: "Cooperativa", responsable: "José Ramírez", correo: "jose@coopoccidente.com", telefono: "+502 5555-1003", plan: "Agro Pro", instancias: 3, suscripcion: "Activa", estado: "Activo", registro: "18 jun 2026", almacenamiento: "65 / 100 GB" },
  { id: "CL04", nombre: "Agro Export GT", tipo: "Empresa agroindustrial", responsable: "Luis Castillo", correo: "luis@agroexport.com", telefono: "+502 5555-1004", plan: "Agro Enterprise", instancias: 5, suscripcion: "Activa", estado: "Activo", registro: "02 jul 2026", almacenamiento: "180 / 250 GB" },
  { id: "CL05", nombre: "Hacienda Santa Cruz", tipo: "Finca", responsable: "Marta Cifuentes", correo: "marta@haciendasc.com", telefono: "+502 5555-1005", plan: "Finca", instancias: 1, suscripcion: "Activa", estado: "Activo", registro: "10 ago 2026", almacenamiento: "5 / 10 GB" },
  { id: "CL06", nombre: "Agrícola Del Norte", tipo: "Empresa agroindustrial", responsable: "Raúl Mendoza", correo: "raul@agricolanorte.com", telefono: "+502 5555-1006", plan: "Agro Pro", instancias: 2, suscripcion: "Activa", estado: "Activo", registro: "15 ago 2026", almacenamiento: "41 / 100 GB" },
  { id: "CL07", nombre: "Café Export S.A.", tipo: "Empresa agroindustrial", responsable: "Diana Pérez", correo: "diana@cafeexport.com", telefono: "+502 5555-1007", plan: "Productor", instancias: 1, suscripcion: "Suspendida", estado: "Suspendido", registro: "20 ene 2026", almacenamiento: "0 / 50 GB" },
];

function AdminClientes() {
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<ClienteAdmin | null>(null);
  const [tab, setTab] = useState("Información");

  const filtered = CLIENTES_DATA.filter(c =>
    (tipoFilter === "Todos" || c.tipo === tipoFilter) &&
    (planFilter === "Todos" || c.plan === planFilter) &&
    (c.nombre.toLowerCase().includes(search.toLowerCase()) || c.responsable.toLowerCase().includes(search.toLowerCase()))
  );

  if (detalle) {
    const tabs = ["Información", "Instancias", "Pagos", "Suscripción", "Actividad"];
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Clientes
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-800 font-medium">{detalle.nombre}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lime-50 flex items-center justify-center text-lime-700 font-bold text-lg">{detalle.nombre[0]}</div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">{detalle.nombre}</h2>
                  <p className="text-xs text-gray-400">{detalle.tipo}</p>
                </div>
              </div>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              {[
                ["Responsable", detalle.responsable], ["Correo", detalle.correo],
                ["Teléfono", detalle.telefono], ["Registro", detalle.registro],
                ["Plan actual", detalle.plan], ["Suscripción", detalle.suscripcion],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-gray-400 mb-0.5">{k}</p>
                  <p className="text-sm text-gray-800 font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Instancias", value: String(detalle.instancias), sub: "instancias activas" },
              { label: "Almacenamiento", value: detalle.almacenamiento, sub: "utilizado" },
            ].map(k => (
              <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-400 mb-1">{k.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{k.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{k.sub}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="flex gap-0 border-b border-gray-100 px-4">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-lime-400 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{t}</button>
            ))}
          </div>
          <div className="p-6 text-sm text-gray-500">
            {tab === "Información" && (
              <div className="grid grid-cols-2 gap-6">
                {[["ID de cliente", detalle.id], ["Tipo", detalle.tipo], ["Plan", detalle.plan], ["Fecha de registro", detalle.registro]].map(([k, v]) => (
                  <div key={k}><p className="text-xs text-gray-400 mb-1">{k}</p><p className="text-sm text-gray-800">{v}</p></div>
                ))}
              </div>
            )}
            {tab !== "Información" && <p className="text-xs text-gray-400 py-8 text-center">Sin datos disponibles para esta sección.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de clientes y organizaciones de AgroCloud.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nuevo cliente</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL CLIENTES", value: "31", sub: "Organizaciones registradas", color: "text-blue-500 bg-blue-50", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
          { label: "CLIENTES ACTIVOS", value: "28", sub: "Con suscripción vigente", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "COOPERATIVAS", value: "8", sub: "Organizaciones cooperativas", color: "text-purple-500 bg-purple-50", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          { label: "EMPRESAS", value: "6", sub: "Empresas agroindustriales", color: "text-orange-500 bg-orange-50", icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Finca", "Cooperativa", "Empresa agroindustrial"].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Finca", "Productor", "Agro Pro", "Agro Enterprise"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Cliente", "Tipo", "Responsable", "Plan", "Instancias", "Suscripción", "Estado", "Registro", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetalle(c)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-lime-50 flex items-center justify-center text-lime-700 text-xs font-bold shrink-0">{c.nombre[0]}</div>
                    <span className="text-xs font-medium text-gray-900 whitespace-nowrap">{c.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{c.tipo}</td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{c.responsable}</td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{c.plan}</td>
                <td className="px-5 py-4 text-xs text-gray-600">{c.instancias} {c.instancias === 1 ? "instancia" : "instancias"}</td>
                <td className="px-5 py-4"><StatusBadge s={c.suscripcion} /></td>
                <td className="px-5 py-4"><StatusBadge s={c.estado} /></td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{c.registro}</td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === c.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver perfil", "Editar", "Ver instancias", "Ver suscripción", "Ver pagos", "Suspender"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver perfil") setDetalle(c); }} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i === 5 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} cliente{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── ADMIN: Instancias ────────────────────────────────────────────────────────

interface InstanciaAdmin {
  id: string; nombre: string; cliente: string; plantilla: string; plan: string;
  almacenamiento: string; estado: string; creada: string; cpu: number; ram: number; conexiones: number;
}

const INSTANCIAS_ADMIN: InstanciaAdmin[] = [
  { id: "I01", nombre: "agro-produccion-db", cliente: "Finca Los Pinos", plantilla: "Cosechas y producción", plan: "Productor", almacenamiento: "22 / 50 GB", estado: "Activa", creada: "28 ago 2026", cpu: 78, ram: 62, conexiones: 14 },
  { id: "I02", nombre: "agro-inventario-db", cliente: "Finca El Roble", plantilla: "Control de inventarios", plan: "Productor", almacenamiento: "10 / 50 GB", estado: "Detenida", creada: "30 ago 2026", cpu: 0, ram: 0, conexiones: 0 },
  { id: "I03", nombre: "coop-occidente-db", cliente: "Cooperativa Occidente", plantilla: "Cultivos y parcelas", plan: "Agro Pro", almacenamiento: "45 / 100 GB", estado: "Activa", creada: "31 ago 2026", cpu: 34, ram: 45, conexiones: 8 },
  { id: "I04", nombre: "santa-cruz-db", cliente: "Hacienda Santa Cruz", plantilla: "Gestión de trabajadores", plan: "Finca", almacenamiento: "5 / 10 GB", estado: "Activa", creada: "10 ago 2026", cpu: 22, ram: 38, conexiones: 3 },
  { id: "I05", nombre: "agricola-norte-db", cliente: "Agrícola Del Norte", plantilla: "Trazabilidad", plan: "Agro Pro", almacenamiento: "41 / 100 GB", estado: "Activa", creada: "15 ago 2026", cpu: 41, ram: 55, conexiones: 6 },
  { id: "I06", nombre: "cafe-export-db", cliente: "Café Export S.A.", plantilla: "Clientes y ventas", plan: "Productor", almacenamiento: "0 / 50 GB", estado: "Suspendida", creada: "20 ene 2026", cpu: 0, ram: 0, conexiones: 0 },
  { id: "I07", nombre: "agroexport-principal", cliente: "Agro Export GT", plantilla: "Cosechas y producción", plan: "Agro Enterprise", almacenamiento: "60 / 250 GB", estado: "Activa", creada: "02 jul 2026", cpu: 55, ram: 48, conexiones: 22 },
];

function AdminInstancias() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<InstanciaAdmin | null>(null);

  const filtered = INSTANCIAS_ADMIN.filter(i =>
    (estadoFilter === "Todos" || i.estado === estadoFilter) &&
    (i.nombre.toLowerCase().includes(search.toLowerCase()) || i.cliente.toLowerCase().includes(search.toLowerCase()))
  );

  if (detalle) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Instancias
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-mono text-gray-800">{detalle.nombre}</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 font-mono">{detalle.nombre}</h2>
            <p className="text-xs text-gray-400">{detalle.cliente}</p>
          </div>
          <StatusBadge s={detalle.estado} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Información general</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ["Motor", "PostgreSQL"], ["Versión", "PostgreSQL 16"],
                ["Cliente", detalle.cliente], ["Plantilla", detalle.plantilla],
                ["Plan", detalle.plan], ["Almacenamiento", detalle.almacenamiento],
                ["Fecha de creación", detalle.creada], ["Región", "us-east-1"],
              ].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="text-sm text-gray-800 font-medium">{v}</p></div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Estado de recursos</h3>
            <div className="space-y-5">
              {[
                { label: "CPU", value: detalle.cpu, color: detalle.cpu > 70 ? "bg-red-400" : detalle.cpu > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "RAM", value: detalle.ram, color: detalle.ram > 70 ? "bg-red-400" : detalle.ram > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "Almacenamiento", value: Math.round(parseInt(detalle.almacenamiento) / parseInt(detalle.almacenamiento.split("/")[1]) * 100), color: "bg-blue-400" },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">{r.label}</span>
                    <span className="text-xs font-medium text-gray-800">{r.value}%</span>
                  </div>
                  <ProgressBar value={r.value} color={r.color} />
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600">Conexiones activas</span>
                  <span className="text-xs font-semibold text-gray-800">{detalle.conexiones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Actividad reciente</h3>
          <div className="space-y-3">
            {["Consulta ejecutada correctamente", "Backup automático completado", "Conexión establecida desde 192.168.1.10", "Índice reconstruido en tabla cosechas"].map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                <span className="text-gray-600">{a}</span>
                <span className="text-gray-400 ml-auto whitespace-nowrap">hace {i + 1}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Instancias</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de instancias PostgreSQL de AgroCloud.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva instancia</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL", value: "38", sub: "Instancias registradas", color: "text-blue-500 bg-blue-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "ACTIVAS", value: "34", sub: "En producción", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "DETENIDAS", value: "2", sub: "Sin servicio", color: "text-red-500 bg-red-50", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "MANTENIMIENTO", value: "2", sub: "En revisión técnica", color: "text-amber-500 bg-amber-50", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar instancia..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Activa", "Detenida", "En mantenimiento", "Suspendida"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Instancia", "Cliente", "Plantilla", "Plan", "Almacenamiento", "Estado", "Creada", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(inst => (
              <tr key={inst.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetalle(inst)}>
                <td className="px-5 py-4 font-mono text-xs font-medium text-gray-900 whitespace-nowrap">{inst.nombre}</td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{inst.cliente}</td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inst.plantilla}</td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inst.plan}</td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{inst.almacenamiento}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{inst.creada}</td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === inst.id ? null : inst.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === inst.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver detalles", "Ver métricas", "Reiniciar", "Detener", "Iniciar", "Suspender", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver detalles") setDetalle(inst); }} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i >= 5 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} instancia{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── ADMIN: Planes ────────────────────────────────────────────────────────────

function AdminPlanes() {
  const [modalOpen, setModalOpen] = useState(false);
  const planes = [
    { nombre: "Finca", precio: "Q25", storage: "10 GB", instancias: "1", clientes: 8, ingresos: "Q200" },
    { nombre: "Productor", precio: "Q60", storage: "50 GB", instancias: "2", clientes: 14, ingresos: "Q840" },
    { nombre: "Agro Pro", precio: "Q120", storage: "100 GB", instancias: "3", clientes: 6, ingresos: "Q720" },
    { nombre: "Agro Enterprise", precio: "Q250", storage: "250 GB", instancias: "5", clientes: 3, ingresos: "Q750" },
  ];
  const totalIngresos = "Q2,510";

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Planes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de planes comerciales de AgroCloud.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nuevo plan</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "PLANES ACTIVOS", value: "4", sub: "Planes disponibles", color: "text-blue-500 bg-blue-50", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { label: "SUSCRIPCIONES", value: "31", sub: "Activas en total", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
          { label: "MÁS CONTRATADO", value: "Productor", sub: "14 suscriptores", color: "text-purple-500 bg-purple-50", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
          { label: "INGRESO MENSUAL", value: totalIngresos, sub: "Estimado total", color: "text-green-600 bg-green-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {planes.map(plan => (
          <div key={plan.nombre} className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-lime-100 text-lime-700 border border-lime-300">Activo</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-base mb-1">{plan.nombre}</h3>
            <div className="text-2xl font-bold text-gray-900 mb-1">{plan.precio}<span className="text-xs font-normal text-gray-400"> /mes</span></div>
            <div className="space-y-1.5 mt-3 mb-4">
              {[
                { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8", text: `${plan.storage} almacenamiento` },
                { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", text: `${plan.instancias} instancia${plan.instancias !== "1" ? "s" : ""} PostgreSQL` },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div><p className="text-xs text-gray-400">Clientes</p><p className="text-lg font-semibold text-gray-900">{plan.clientes}</p></div>
                <div className="text-right"><p className="text-xs text-gray-400">Ingreso</p><p className="text-lg font-semibold text-lime-600">{plan.ingresos}</p></div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors">Editar</button>
                <button className="flex-1 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors">Suscriptores</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-900">Nuevo plan</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Nombre del plan", placeholder: "Ej. Agro Plus" }, { label: "Precio mensual (Q)", placeholder: "0.00" }].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Almacenamiento (GB)", placeholder: "Ej. 50" }, { label: "Cant. de instancias", placeholder: "Ej. 2" }].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                    <input type="text" placeholder={f.placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Descripción</label>
                <textarea rows={2} placeholder="Descripción del plan..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Estado</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white">
                  <option>Activo</option><option>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg text-sm font-semibold transition-colors">Guardar plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: Suscripciones ─────────────────────────────────────────────────────

interface Suscripcion {
  id: string; cliente: string; plan: string; precio: string; inicio: string; renovacion: string; estado: string;
}

const SUSCRIPCIONES_DATA: Suscripcion[] = [
  { id: "SUB-001", cliente: "Finca Los Pinos", plan: "Productor", precio: "Q60", inicio: "01/08/2026", renovacion: "01/10/2026", estado: "Activa" },
  { id: "SUB-002", cliente: "Finca El Roble", plan: "Productor", precio: "Q60", inicio: "15/08/2026", renovacion: "15/09/2026", estado: "Activa" },
  { id: "SUB-003", cliente: "Cooperativa Occidente", plan: "Agro Pro", precio: "Q120", inicio: "20/08/2026", renovacion: "20/09/2026", estado: "Activa" },
  { id: "SUB-004", cliente: "Agro Export GT", plan: "Agro Enterprise", precio: "Q250", inicio: "02/07/2026", renovacion: "02/10/2026", estado: "Activa" },
  { id: "SUB-005", cliente: "Hacienda Santa Cruz", plan: "Finca", precio: "Q25", inicio: "10/08/2026", renovacion: "10/09/2026", estado: "Activa" },
  { id: "SUB-006", cliente: "Agrícola Del Norte", plan: "Agro Pro", precio: "Q120", inicio: "15/07/2026", renovacion: "15/09/2026", estado: "Activa" },
  { id: "SUB-007", cliente: "Café Export S.A.", plan: "Productor", precio: "Q60", inicio: "20/01/2026", renovacion: "20/02/2026", estado: "Suspendida" },
  { id: "SUB-008", cliente: "Finca Las Margaritas", plan: "Finca", precio: "Q25", inicio: "01/06/2026", renovacion: "01/09/2026", estado: "Vencida" },
];

function AdminSuscripciones() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [planFilter, setPlanFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Suscripcion | null>(null);

  const filtered = SUSCRIPCIONES_DATA.filter(s =>
    (estadoFilter === "Todos" || s.estado === estadoFilter) &&
    (planFilter === "Todos" || s.plan === planFilter) &&
    s.cliente.toLowerCase().includes(search.toLowerCase())
  );

  if (detalle) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Suscripciones
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-800 font-medium">{detalle.id}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">{detalle.id}</h2>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[["Cliente", detalle.cliente], ["Plan", detalle.plan], ["Precio", detalle.precio + " /mes"], ["Fecha de inicio", detalle.inicio], ["Próxima renovación", detalle.renovacion], ["Método de pago", "Tarjeta •••• 4242"]].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="text-sm text-gray-800 font-medium">{v}</p></div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Acciones</h3>
            <div className="space-y-2">
              {["Renovar suscripción", "Cambiar plan", "Suspender"].map((a, i) => (
                <button key={a} className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${i === 0 ? "bg-lime-400 hover:bg-lime-300 text-gray-900" : i === 2 ? "border border-red-200 text-red-500 hover:bg-red-50" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{a}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Historial de renovaciones</h3>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100"><th className="pb-2 text-left text-gray-400 font-medium">Período</th><th className="pb-2 text-left text-gray-400 font-medium">Monto</th><th className="pb-2 text-left text-gray-400 font-medium">Estado</th><th className="pb-2 text-left text-gray-400 font-medium">Fecha</th></tr></thead>
            <tbody>
              {[["ago 2026", detalle.precio, "Pagado", "01 ago 2026"], ["jul 2026", detalle.precio, "Pagado", "01 jul 2026"], ["jun 2026", detalle.precio, "Pagado", "01 jun 2026"]].map(([p, m, e, f]) => (
                <tr key={p} className="border-b border-gray-50">
                  <td className="py-3 text-gray-700">{p}</td><td className="py-3 text-gray-700">{m}</td><td className="py-3"><StatusBadge s={e} /></td><td className="py-3 text-gray-400">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Suscripciones</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de suscripciones de AgroCloud.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "ACTIVAS", value: "31", sub: "Suscripciones vigentes", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PRÓX. RENOVAR", value: "7", sub: "En los próximos 15 días", color: "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "SUSPENDIDAS", value: "2", sub: "Acceso restringido", color: "text-red-500 bg-red-50", icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" },
          { label: "CANCELADAS", value: "3", sub: "Sin renovación", color: "text-gray-500 bg-gray-100", icon: "M6 18L18 6M6 6l12 12" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Activa", "Pendiente", "Suspendida", "Cancelada", "Vencida"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Finca", "Productor", "Agro Pro", "Agro Enterprise"].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["ID", "Cliente", "Plan", "Precio", "Inicio", "Próx. renovación", "Estado", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setDetalle(s)}>
                <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900">{s.id}</td>
                <td className="px-5 py-4 text-xs text-gray-700 whitespace-nowrap">{s.cliente}</td>
                <td className="px-5 py-4 text-xs text-gray-600 whitespace-nowrap">{s.plan}</td>
                <td className="px-5 py-4 text-xs font-semibold text-gray-900">{s.precio}</td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{s.inicio}</td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{s.renovacion}</td>
                <td className="px-5 py-4"><StatusBadge s={s.estado} /></td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === s.id ? null : s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === s.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver detalle", "Renovar", "Cambiar plan", "Suspender", "Cancelar"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver detalle") setDetalle(s); }} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i >= 3 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} suscripción{filtered.length !== 1 ? "es" : ""}</div>
      </div>
    </div>
  );
}

// ─── ADMIN: Pagos ─────────────────────────────────────────────────────────────

interface PagoAdmin {
  id: string; cliente: string; concepto: string; monto: number; metodo: string; fecha: string; estado: string;
}

const PAGOS_ADMIN: PagoAdmin[] = [
  { id: "PAY-1058", cliente: "Finca Los Pinos", concepto: "Plan Productor", monto: 60, metodo: "Tarjeta", fecha: "29 ago 2026", estado: "Pagado" },
  { id: "PAY-1057", cliente: "Cooperativa Occidente", concepto: "Plan Agro Pro", monto: 120, metodo: "Tarjeta", fecha: "28 ago 2026", estado: "Pagado" },
  { id: "PAY-1056", cliente: "Finca El Roble", concepto: "Plan Productor", monto: 60, metodo: "Transferencia", fecha: "27 ago 2026", estado: "Pendiente" },
  { id: "PAY-1055", cliente: "Agro Export GT", concepto: "Plan Agro Enterprise", monto: 250, metodo: "Tarjeta", fecha: "26 ago 2026", estado: "Pagado" },
  { id: "PAY-1054", cliente: "Hacienda Santa Cruz", concepto: "Plan Finca", monto: 25, metodo: "Transferencia", fecha: "25 ago 2026", estado: "Pagado" },
  { id: "PAY-1053", cliente: "Agrícola Del Norte", concepto: "Plan Agro Pro", monto: 120, metodo: "Tarjeta", fecha: "24 ago 2026", estado: "Pagado" },
  { id: "PAY-1052", cliente: "Café Export S.A.", concepto: "Plan Productor", monto: 60, metodo: "Tarjeta", fecha: "20 ago 2026", estado: "Rechazado" },
];

const MESES_INGRESOS = [
  { mes: "Abr", monto: 1820 },
  { mes: "May", monto: 2050 },
  { mes: "Jun", monto: 1950 },
  { mes: "Jul", monto: 2310 },
  { mes: "Ago", monto: 2510 },
  { mes: "Sep", monto: 2180 },
];

function PagoEstadoBadge({ estado }: { estado: string }) {
  const cls = estado === "Pagado" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : estado === "Pendiente" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : estado === "Rechazado" ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-gray-100 text-gray-500 border border-gray-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{estado}</span>;
}

function AdminPagos() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const maxMonto = Math.max(...MESES_INGRESOS.map(m => m.monto));
  const filtered = PAGOS_ADMIN.filter(p =>
    (estadoFilter === "Todos" || p.estado === estadoFilter) &&
    (p.cliente.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Pagos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de pagos de la plataforma AgroCloud.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "INGRESOS DEL MES", value: "Q2,510", sub: "Septiembre 2026", color: "text-lime-600 bg-lime-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS COMPLETADOS", value: "28", sub: "Este mes", color: "text-blue-500 bg-blue-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS PENDIENTES", value: "4", sub: "En proceso", color: "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS RECHAZADOS", value: "1", sub: "Requieren atención", color: "text-red-500 bg-red-50", icon: "M6 18L18 6M6 6l12 12" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">Ingresos mensuales</h2>
            <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
          </div>
          <span className="text-xs text-gray-400">Q (quetzales)</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {MESES_INGRESOS.map(m => (
            <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-500 font-medium">Q{(m.monto / 1000).toFixed(1)}k</span>
              <div className="w-full rounded-t-md bg-lime-400 hover:bg-lime-300 transition-colors cursor-default" style={{ height: `${(m.monto / maxMonto) * 96}px` }} />
              <span className="text-[10px] text-gray-400">{m.mes}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pago..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-lime-400">
          {["Todos", "Pagado", "Pendiente", "Rechazado", "Reembolsado"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Transacción", "Cliente", "Concepto", "Monto", "Método", "Fecha", "Estado", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-900">{p.id}</td>
                <td className="px-5 py-4 text-xs text-gray-700 whitespace-nowrap">{p.cliente}</td>
                <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">{p.concepto}</td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900">Q{p.monto}</td>
                <td className="px-5 py-4 text-xs text-gray-500">{p.metodo}</td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{p.fecha}</td>
                <td className="px-5 py-4"><PagoEstadoBadge estado={p.estado} /></td>
                <td className="px-5 py-4 relative">
                  <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-4 top-10 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 text-xs">
                        {["Ver detalle", "Ver comprobante", "Descargar recibo", "Reembolsar"].map((a, i) => (
                          <button key={a} onClick={() => setMenuOpen(null)} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i === 3 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} pago{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}

// ─── ADMIN: Plantillas DB ─────────────────────────────────────────────────────

interface PlantillaAdmin {
  id: string; nombre: string; descripcion: string; tablas: number; version: string; instancias: number; estado: string; actualizada: string;
  schema: string[];
}

const PLANTILLAS_ADMIN: PlantillaAdmin[] = [
  { id: "TPL-01", nombre: "Cultivos y parcelas", descripcion: "Estructura PostgreSQL para gestionar cultivos, parcelas, ciclos productivos y terrenos.", tablas: 12, version: "1.2", instancias: 8, estado: "Activa", actualizada: "01 sep 2026", schema: ["cultivos", "parcelas", "ciclos_productivos", "terrenos", "insumos", "labores", "costos", "trabajadores", "maquinaria", "proveedores", "clientes", "reportes"] },
  { id: "TPL-02", nombre: "Cosechas y producción", descripcion: "Base de datos para registrar cosechas, producción agrícola y rendimiento.", tablas: 14, version: "1.4", instancias: 12, estado: "Activa", actualizada: "05 sep 2026", schema: ["cosechas", "producciones", "cultivos", "parcelas", "productos", "trabajadores", "maquinaria", "calidad", "empaque", "almacenamiento", "destinos", "rendimientos", "temporadas", "reportes"] },
  { id: "TPL-03", nombre: "Control de inventarios", descripcion: "Gestión de productos, insumos, existencias y movimientos de inventario.", tablas: 10, version: "1.3", instancias: 7, estado: "Activa", actualizada: "03 sep 2026", schema: ["productos", "insumos", "existencias", "movimientos", "bodegas", "proveedores", "pedidos", "categorias", "unidades", "reportes"] },
  { id: "TPL-04", nombre: "Gestión de trabajadores", descripcion: "Administración de trabajadores, puestos, jornadas y actividades agrícolas.", tablas: 11, version: "1.1", instancias: 5, estado: "Activa", actualizada: "28 ago 2026", schema: ["trabajadores", "puestos", "jornadas", "actividades", "pagos", "deducciones", "prestaciones", "contratos", "asistencias", "parcelas", "reportes"] },
  { id: "TPL-05", nombre: "Maquinaria", descripcion: "Administración de maquinaria agrícola, mantenimientos y utilización.", tablas: 9, version: "1.0", instancias: 3, estado: "Activa", actualizada: "20 ago 2026", schema: ["maquinas", "mantenimientos", "operadores", "combustible", "reparaciones", "parcelas", "registros", "costos", "reportes"] },
  { id: "TPL-06", nombre: "Proveedores", descripcion: "Gestión de proveedores, productos, pedidos y compras.", tablas: 8, version: "1.1", instancias: 4, estado: "Activa", actualizada: "22 ago 2026", schema: ["proveedores", "productos", "pedidos", "compras", "pagos", "categorias", "contactos", "reportes"] },
  { id: "TPL-07", nombre: "Clientes y ventas", descripcion: "Gestión comercial de clientes, pedidos, ventas y facturación.", tablas: 10, version: "1.2", instancias: 6, estado: "Activa", actualizada: "25 ago 2026", schema: ["clientes", "pedidos", "ventas", "facturas", "productos", "pagos", "descuentos", "contactos", "rutas", "reportes"] },
];

function AdminPlantillas() {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<PlantillaAdmin | null>(null);
  const [tab, setTab] = useState("Resumen");

  const filtered = PLANTILLAS_ADMIN.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (detalle) {
    const tabs = ["Resumen", "Estructura", "Relaciones", "Versiones"];
    return (
      <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Plantillas DB
          </button>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-800 font-medium">{detalle.nombre}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{detalle.nombre}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{detalle.descripcion}</p>
                </div>
              </div>
              <StatusBadge s={detalle.estado} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              {[["Versión", `v${detalle.version}`], ["Tablas", String(detalle.tablas)], ["Instancias", String(detalle.instancias)], ["Actualizada", detalle.actualizada]].map(([k, v]) => (
                <div key={k} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{k}</p>
                  <p className="text-sm font-semibold text-gray-800">{v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Acciones</h3>
            <div className="space-y-2">
              {["Editar plantilla", "Duplicar", "Descargar SQL"].map(a => (
                <button key={a} className="w-full py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors text-left px-3">{a}</button>
              ))}
              <button className="w-full py-2 border border-red-200 rounded-lg text-xs text-red-500 hover:bg-red-50 font-medium transition-colors text-left px-3">Desactivar</button>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="flex gap-0 border-b border-gray-100 px-4">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-lime-400 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>{t}</button>
            ))}
          </div>
          <div className="p-6">
            {tab === "Resumen" && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Tablas incluidas</p>
                <div className="flex flex-wrap gap-2">
                  {detalle.schema.map(t => (
                    <div key={t} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
                      <span className="text-xs font-mono text-gray-700">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === "Estructura" && (
              <div className="space-y-2">
                {detalle.schema.map(t => (
                  <div key={t} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 6h18M3 14h18M3 18h18" /></svg>
                      <span className="text-xs font-mono text-gray-800">{t}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">PostgreSQL table</span>
                  </div>
                ))}
              </div>
            )}
            {(tab === "Relaciones" || tab === "Versiones") && (
              <p className="text-xs text-gray-400 py-8 text-center">Información no disponible.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Plantillas DB</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de plantillas PostgreSQL disponibles en AgroCloud.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva plantilla</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "DISPONIBLES", value: "7", sub: "Plantillas en plataforma", color: "text-blue-500 bg-blue-50", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
          { label: "ACTIVAS", value: "7", sub: "En uso por clientes", color: "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "INSTANCIAS", value: "38", sub: "Usan una plantilla", color: "text-purple-500 bg-purple-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "MÁS UTILIZADA", value: "Cosechas", sub: "12 instancias activas", color: "text-orange-500 bg-orange-50", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantilla..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col hover:border-lime-200 hover:shadow-sm transition-all cursor-pointer" onClick={() => setDetalle(p)}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <StatusBadge s={p.estado} />
                <div className="relative">
                  <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-40 text-xs">
                        {["Ver estructura", "Editar", "Duplicar", "Desactivar", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver estructura") setDetalle(p); }} className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${i >= 3 ? "text-red-500" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{p.nombre}</h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4 flex-1">{p.descripcion}</p>
            <div className="flex items-center gap-4 text-[10px] text-gray-400 border-t border-gray-50 pt-3">
              <span>{p.tablas} tablas</span>
              <span>v{p.version}</span>
              <span>{p.instancias} instancias</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageLabels: Record<AdminPage, string> = { dashboard: "Panel Administrativo", usuarios: "Usuarios", clientes: "Clientes", instancias: "Instancias", planes: "Planes", suscripciones: "Suscripciones", pagos: "Pagos", plantillas: "Plantillas DB", monitoreo: "Monitoreo", incidencias: "Incidencias", configuracion: "Configuración", documentacion: "Documentación" };
  return (
    <div className="flex h-full">
      <AdminSidebar page={page} setPage={setPage} onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm text-gray-500 flex-1 truncate">{pageLabels[page]}</span>
          <div className="relative hidden md:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input placeholder="Buscar en la plataforma" className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-400 w-56" />
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors relative">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-semibold">DA</div>
            <div><p className="text-xs font-medium text-gray-800 leading-none">David Admin</p><p className="text-[10px] text-gray-400">Administrador</p></div>
          </div>
        </header>
        {page === "dashboard" && <AdminDashboard />}
        {page === "usuarios" && <AdminUsuarios />}
        {page === "clientes" && <AdminClientes />}
        {page === "instancias" && <AdminInstancias />}
        {page === "planes" && <AdminPlanes />}
        {page === "suscripciones" && <AdminSuscripciones />}
        {page === "pagos" && <AdminPagos />}
        {page === "plantillas" && <AdminPlantillas />}
        {page === "monitoreo" && <AdminMonitoreo />}
        {page === "incidencias" && <AdminIncidencias />}
        {page === "configuracion" && <AdminPlaceholderPage title={pageLabels[page]} description="Configuración del sistema AgroCloud." />}
        {page === "documentacion" && <SharedDocumentacion />}
      </div>
    </div>
  );
}

// ─── CLIENTE PANEL ────────────────────────────────────────────────────────────

const clienteNav = [
  { page: "dashboard" as ClientePage, label: "Dashboard", section: "RESUMEN", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { page: "instancias" as ClientePage, label: "Instancias", section: "SERVICIOS", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { page: "plantillas" as ClientePage, label: "Plantillas DB", section: null, icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
  { page: "plan" as ClientePage, label: "Plan y suscripción", section: "CUENTA", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
  { page: "pagos" as ClientePage, label: "Pagos", section: null, icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { page: "soporte" as ClientePage, label: "Soporte", section: null, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { page: "configuracion" as ClientePage, label: "Configuración", section: "SISTEMA", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { page: "documentacion" as ClientePage, label: "Documentación", section: null, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

function ClienteDashboard() {
  const clienteActivity = [
    { icon: "resuelta" as const, title: "Instancia creada", sub: "agro-inventario-db · 30 ago" },
    { icon: "abierta" as const, title: "Suscripción renovada", sub: "Plan Productor · 29 ago" },
    { icon: "asignada" as const, title: "Incidencia enviada", sub: "INC-024 · 28 ago" },
  ];
  const myInstances = [
    { nombre: "agro-produccion-db", motor: "PostgreSQL", plantilla: "Cosechas y producción", almac: "22 / 50 GB", estado: "Activa" },
    { nombre: "agro-inventario-db", motor: "PostgreSQL", plantilla: "Control de inventarios", almac: "10 / 50 GB", estado: "Activa" },
  ];
  const myTemplates = [
    { nombre: "Cultivos y parcelas", schema: "Schema PostgreSQL", estado: "ACTIVA" },
    { nombre: "Cosechas y producción", schema: "Schema PostgreSQL", estado: "ACTIVA" },
    { nombre: "Control de inventarios", schema: "Schema PostgreSQL", estado: "ACTIVA" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Panel de control</h1>
          <p className="text-sm text-gray-500 mt-1">Administra tus bases de datos y servicios de AgroCloud.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-3 lg:px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Crear instancia</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "INSTANCIAS", value: "2", sub: "Instancias activas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-lime-600 bg-lime-50" },
          { label: "ALMACENAMIENTO", value: "32 GB", sub: "/ 50 GB", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", color: "text-blue-500 bg-blue-50" },
          { label: "PLAN", value: "Productor", sub: "Q60 / mes", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: "text-purple-500 bg-purple-50" },
          { label: "SUSCRIPCIÓN", value: "Activa", sub: "Estado actual", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-2xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Mis instancias</h2>
              <p className="text-xs text-gray-400 mt-0.5">Recursos PostgreSQL asociados a tu cuenta.</p>
            </div>
            <button className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">Ver detalles</button>
          </div>
          <table className="w-full min-w-max text-xs">
            <thead><tr className="border-b border-gray-100">{["Nombre", "Motor", "Plantilla", "Almac.", "Estado", ""].map(h => <th key={h} className="px-5 py-3 text-center text-gray-400 font-medium uppercase tracking-wide text-[10px]">{h}</th>)}</tr></thead>
            <tbody>
              {myInstances.map(inst => (
                <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50 transition-colors text-center">
                  <td className="px-5 py-4 font-mono font-medium text-gray-900">{inst.nombre}</td>
                  <td className="px-5 py-4 text-gray-500">{inst.motor}</td>
                  <td className="px-5 py-4 text-gray-600">{inst.plantilla}</td>
                  <td className="px-5 py-4 text-gray-500">{inst.almac}</td>
                  <td className="px-5 py-4 flex justify-center"><StatusBadge s={inst.estado} /></td>
                  <td className="px-5 py-4 text-gray-400">· · ·</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-center text-xs text-gray-400">2 de 2 instancias · Capacidad disponible 18 GB</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Actividad reciente</h2>
          </div>
          <div className="p-5 space-y-5">
            {clienteActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <ActivityIcon tipo={a.icon} />
                <div>
                  <p className="text-xs text-gray-800 font-medium">{a.title}</p>
                  <p className="text-[10px] text-gray-400">{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Plantillas disponibles</h2>
            <p className="text-xs text-gray-400 mt-0.5">Schemas preconfigurados para crear nuevas bases de datos.</p>
          </div>
          <button className="text-xs text-lime-600 hover:text-lime-700 font-medium">Ver todas →</button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {myTemplates.map(t => (
            <div key={t.nombre} className="border border-gray-100 rounded-xl p-4 hover:border-lime-200 hover:bg-lime-50/30 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-0.5">{t.nombre}</p>
              <p className="text-xs text-gray-400 mb-3">{t.schema}</p>
              <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 px-2 py-0.5 rounded">{t.estado}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTE: tipos y datos propios ──────────────────────────────────────────

interface CInstancia {
  nombre: string; plantilla: string; usadoGB: number; totalGB: number;
  estado: "Activa" | "Reiniciando" | "Suspendida" | "Error";
  creada: string; version: string; host: string; puerto: string;
  baseDatos: string; usuario: string; password: string;
  cpu: number; memoria: number;
  actividad: { desc: string; tiempo: string; tipo: "ok" | "warn" | "info" }[];
}

interface CPlantillaDB {
  id: string; nombre: string; categoria: string; descripcion: string;
  tablas: number; entidades: string[]; casosDeUso: string[]; icon: string;
}

const C_PLAN = { nombre: "Productor", maxInstancias: 2, totalGB: 50 };

const C_INSTANCIAS: CInstancia[] = [
  {
    nombre: "agro-produccion-db", plantilla: "Cosechas y producción",
    usadoGB: 22, totalGB: 50, estado: "Activa", creada: "2026-08-15",
    version: "PostgreSQL 15.4", host: "agro-produccion-db.agrocloud.io",
    puerto: "5432", baseDatos: "agro_produccion", usuario: "fp_admin", password: "s3cur3P@ss!",
    cpu: 45, memoria: 62,
    actividad: [
      { desc: "Conexión establecida", tiempo: "hace 5 min", tipo: "ok" },
      { desc: "Backup automático completado", tiempo: "hace 2 h", tipo: "ok" },
      { desc: "Pico de CPU detectado (78%)", tiempo: "hace 4 h", tipo: "warn" },
      { desc: "Instancia iniciada", tiempo: "2026-08-15", tipo: "info" },
    ],
  },
  {
    nombre: "agro-inventario-db", plantilla: "Control de inventarios",
    usadoGB: 10, totalGB: 50, estado: "Reiniciando", creada: "2026-08-30",
    version: "PostgreSQL 15.4", host: "agro-inventario-db.agrocloud.io",
    puerto: "5432", baseDatos: "agro_inventario", usuario: "fp_admin", password: "h8dKz#2mP!",
    cpu: 0, memoria: 0,
    actividad: [
      { desc: "Reinicio en progreso", tiempo: "hace 3 min", tipo: "warn" },
      { desc: "Incidencia registrada: INC-023", tiempo: "hace 1 h", tipo: "warn" },
      { desc: "Backup completado", tiempo: "hace 6 h", tipo: "ok" },
      { desc: "Instancia creada", tiempo: "2026-08-30", tipo: "info" },
    ],
  },
];

const C_PLANTILLAS: CPlantillaDB[] = [
  { id: "TPL-001", nombre: "Cultivos y parcelas", categoria: "Producción",
    descripcion: "Schema para gestionar parcelas, ciclos de cultivo y actividades agrícolas por temporada.",
    tablas: 12, entidades: ["Parcelas", "Cultivos", "Ciclos", "Actividades", "Insumos", "Rendimientos"],
    casosDeUso: ["Registro de parcelas georreferenciadas", "Seguimiento de ciclos de cultivo", "Control de insumos aplicados"],
    icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { id: "TPL-002", nombre: "Cosechas y producción", categoria: "Producción",
    descripcion: "Registro de volúmenes cosechados, calidad del producto y trazabilidad por lote de exportación.",
    tablas: 10, entidades: ["Cosechas", "Lotes", "Calidad", "Destinos", "Transportes", "Registro"],
    casosDeUso: ["Trazabilidad de cosecha a destino", "Control de calidad por lote", "Reportes de producción"],
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "TPL-003", nombre: "Control de inventarios", categoria: "Operaciones",
    descripcion: "Entradas, salidas y movimientos de insumos, materiales y productos terminados en bodega.",
    tablas: 9, entidades: ["Productos", "Bodegas", "Entradas", "Salidas", "Ajustes", "Proveedores"],
    casosDeUso: ["Control de stock en tiempo real", "Alertas de inventario mínimo", "Trazabilidad de insumos"],
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { id: "TPL-004", nombre: "Gestión de trabajadores", categoria: "Recursos Humanos",
    descripcion: "Personal, asistencia, planillas salariales y asignación de tareas agrícolas por área.",
    tablas: 11, entidades: ["Empleados", "Áreas", "Asistencia", "Tareas", "Planillas", "Contratos"],
    casosDeUso: ["Control de asistencia diaria", "Generación de planillas", "Asignación de labores por área"],
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "TPL-005", nombre: "Maquinaria", categoria: "Activos",
    descripcion: "Registro de equipos agrícolas, programación de mantenimientos, consumo de combustible y horómetros.",
    tablas: 8, entidades: ["Equipos", "Mantenimientos", "Combustible", "Operadores", "Fallas", "Repuestos"],
    casosDeUso: ["Control de horómetros y kilometraje", "Programación de mantenimientos", "Historial de fallas"],
    icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
  { id: "TPL-006", nombre: "Proveedores", categoria: "Comercial",
    descripcion: "Catálogo de proveedores agrícolas, órdenes de compra, facturas y evaluación de servicio.",
    tablas: 7, entidades: ["Proveedores", "Órdenes", "Facturas", "Productos", "Evaluaciones", "Pagos"],
    casosDeUso: ["Gestión de órdenes de compra", "Evaluación periódica de proveedores", "Control de pagos pendientes"],
    icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { id: "TPL-007", nombre: "Clientes y ventas", categoria: "Comercial",
    descripcion: "CRM agrícola con gestión de clientes, pedidos de cosecha, precios y seguimiento comercial.",
    tablas: 10, entidades: ["Clientes", "Pedidos", "Precios", "Entregas", "Facturación", "Seguimiento"],
    casosDeUso: ["Registro y segmentación de clientes", "Gestión de pedidos y entregas", "Facturación y seguimiento comercial"],
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" },
];

// ─── CLIENTE: helpers de UI ───────────────────────────────────────────────────

function CInstanciaStatusBadge({ s }: { s: CInstancia["estado"] }) {
  const cls = s === "Activa" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : s === "Reiniciando" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : s === "Suspendida" ? "bg-gray-100 text-gray-500 border border-gray-200"
    : "bg-red-50 text-red-600 border border-red-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{s}</span>;
}

function SvgPaths({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {d.split(" M").map((seg, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {}); }}
      aria-label="Copiar al portapapeles"
      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
    >
      {copied
        ? <svg className="w-3.5 h-3.5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      }
    </button>
  );
}

function CreateInstanciaModal({ onClose, plantillaInicial = "" }: { onClose: () => void; plantillaInicial?: string }) {
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState(plantillaInicial);
  const atLimit = C_INSTANCIAS.length >= C_PLAN.maxInstancias;
  const totalUsado = C_INSTANCIAS.reduce((s, i) => s + i.usadoGB, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Crear instancia">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Crear instancia</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {atLimit && (
          <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" /></svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Límite del plan alcanzado</p>
              <p className="text-xs text-amber-700 mt-0.5">Tu plan {C_PLAN.nombre} permite {C_PLAN.maxInstancias} instancias y ya tienes {C_INSTANCIAS.length}. Mejora tu plan para crear más.</p>
              <button className="mt-2 text-xs font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900">Mejorar a Agro Pro →</button>
            </div>
          </div>
        )}

        <div className={`p-6 space-y-4 ${atLimit ? "opacity-50 pointer-events-none select-none" : ""}`}>
          <div>
            <label htmlFor="ci-nombre" className="block text-xs font-medium text-gray-600 mb-1.5">Nombre de la instancia</label>
            <input id="ci-nombre" value={nombre} onChange={e => setNombre(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="ej. mi-base-de-datos"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent font-mono" />
            <p className="text-[10px] text-gray-400 mt-1">Solo minúsculas, números y guiones.</p>
          </div>
          <div>
            <label htmlFor="ci-plantilla" className="block text-xs font-medium text-gray-600 mb-1.5">Plantilla DB</label>
            <select id="ci-plantilla" value={plantilla} onChange={e => setPlantilla(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white">
              <option value="">Seleccionar plantilla...</option>
              {C_PLANTILLAS.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs">
            <p className="font-medium text-gray-700">Resumen del plan</p>
            <div className="flex justify-between text-gray-500"><span>Plan activo</span><span className="font-medium text-gray-800">{C_PLAN.nombre}</span></div>
            <div className="flex justify-between text-gray-500"><span>Almacenamiento disponible</span><span className="font-medium text-gray-800">{C_PLAN.totalGB - totalUsado} GB</span></div>
            <div className="flex justify-between text-gray-500">
              <span>Instancias ({C_INSTANCIAS.length}/{C_PLAN.maxInstancias})</span>
              <span className={`font-medium ${atLimit ? "text-amber-600" : "text-gray-800"}`}>{atLimit ? "Límite alcanzado" : "Disponible"}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
          <button disabled={atLimit || !nombre || !plantilla}
            className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg text-sm transition-colors">
            Crear instancia
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTE: Vista Instancias ────────────────────────────────────────────────

function ClienteInstancias() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | CInstancia["estado"]>("todas");
  const [view, setView] = useState<"list" | "grid">("list");
  const [drawer, setDrawer] = useState<CInstancia | null>(null);
  const [credModal, setCredModal] = useState<CInstancia | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CInstancia | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const filtered = C_INSTANCIAS.filter(inst => {
    const matchSearch = inst.nombre.toLowerCase().includes(search.toLowerCase()) || inst.plantilla.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todas" || inst.estado === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUsado = C_INSTANCIAS.reduce((s, i) => s + i.usadoGB, 0);
  const activas = C_INSTANCIAS.filter(i => i.estado === "Activa").length;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Instancias</h1>
          <p className="text-sm text-gray-500 mt-1">Administra tus bases de datos PostgreSQL contratadas en AgroCloud.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Crear instancia
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total instancias", value: `${C_INSTANCIAS.length} / ${C_PLAN.maxInstancias}`, sub: "Plan " + C_PLAN.nombre, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-lime-600 bg-lime-50" },
          { label: "Activas", value: String(activas), sub: `${C_INSTANCIAS.length - activas} con incidencias`, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
          { label: "Almacenamiento usado", value: `${totalUsado} GB`, sub: `de ${C_PLAN.totalGB} GB del plan`, icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", color: "text-blue-500 bg-blue-50" },
          { label: "Almacenamiento disponible", value: `${C_PLAN.totalGB - totalUsado} GB`, sub: "Disponible para nuevas instancias", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-gray-500 bg-gray-100" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-4 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o plantilla..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["todas", "Activa", "Reiniciando", "Suspendida", "Error"] as const).map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView("list")} aria-label="Vista lista" className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </button>
          <button onClick={() => setView("grid")} aria-label="Vista cuadrícula" className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Empty / no results */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">Ninguna instancia coincide con la búsqueda o filtro activo.</p>
          <button onClick={() => { setSearch(""); setStatusFilter("todas"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["Instancia", "Plantilla", "Almacenamiento", "Estado", "Creada", "Acciones"].map(h => (
                  <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inst => (
                <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-lime-50 flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                      </div>
                      <div className="text-left">
                        <p className="font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{inst.nombre}</p>
                        <p className="text-[10px] text-gray-400">{inst.version}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">{inst.plantilla}</td>
                  <td className="px-4 py-3.5 w-36">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>{inst.usadoGB} GB</span><span>{inst.totalGB} GB</span></div>
                    <ProgressBar value={(inst.usadoGB / inst.totalGB) * 100} color={inst.usadoGB / inst.totalGB > 0.8 ? "bg-red-400" : inst.usadoGB / inst.totalGB > 0.6 ? "bg-amber-400" : "bg-lime-400"} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap flex justify-center"><CInstanciaStatusBadge s={inst.estado} /></td>
                  <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{inst.creada}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                      <button onClick={() => setDrawer(inst)} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">Detalles</button>
                      <button onClick={() => { setShowPass(false); setCredModal(inst); }} className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors">Credenciales</button>
                      <button className="px-2 py-1 text-xs text-amber-600 hover:bg-amber-50 rounded transition-colors">Reiniciar</button>
                      <button onClick={() => setDeleteConfirm(inst)} className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(inst => (
            <div key={inst.nombre} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-lime-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-900">{inst.nombre}</p>
                    <p className="text-[10px] text-gray-400">{inst.version}</p>
                  </div>
                </div>
                <CInstanciaStatusBadge s={inst.estado} />
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-xs"><span className="text-gray-400">Plantilla</span><span className="text-gray-700 font-medium">{inst.plantilla}</span></div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>Almacenamiento</span><span>{inst.usadoGB} / {inst.totalGB} GB</span></div>
                  <ProgressBar value={(inst.usadoGB / inst.totalGB) * 100} color={inst.usadoGB / inst.totalGB > 0.8 ? "bg-red-400" : "bg-lime-400"} />
                </div>
                <div className="flex justify-between text-xs"><span className="text-gray-400">Creada</span><span className="text-gray-700">{inst.creada}</span></div>
              </div>
              <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setDrawer(inst)} className="py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Detalles</button>
                <button onClick={() => { setShowPass(false); setCredModal(inst); }} className="py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Credenciales</button>
                <button className="py-1.5 text-xs font-medium text-amber-600 border border-amber-100 rounded-lg hover:bg-amber-50 transition-colors">Reiniciar</button>
                <button onClick={() => setDeleteConfirm(inst)} className="py-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: detalles */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDrawer(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" aria-label="Detalles de instancia">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center"><svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <div><p className="font-mono text-sm font-semibold text-gray-900">{drawer.nombre}</p><p className="text-[10px] text-gray-400">{drawer.version}</p></div>
              </div>
              <button onClick={() => setDrawer(null)} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-6">
              <div className="flex items-center gap-2">
                <CInstanciaStatusBadge s={drawer.estado} />
                <span className="text-xs text-gray-400">· Creada {drawer.creada}</span>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Consumo de recursos</p>
                <div className="space-y-3">
                  {[
                    { label: "CPU", value: drawer.cpu },
                    { label: "Memoria", value: drawer.memoria },
                    { label: "Almacenamiento", value: Math.round((drawer.usadoGB / drawer.totalGB) * 100), extra: `${drawer.usadoGB} / ${drawer.totalGB} GB` },
                  ].map(r => (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{r.label}</span>
                        <span className="font-mono">{r.extra ?? `${r.value}%`}</span>
                      </div>
                      <ProgressBar value={r.value} color={r.value > 70 ? "bg-red-400" : r.value > 50 ? "bg-amber-400" : "bg-lime-400"} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Plantilla aplicada</p>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" /></svg>
                  </div>
                  <div><p className="text-xs font-medium text-gray-800">{drawer.plantilla}</p><p className="text-[10px] text-gray-400">Schema PostgreSQL</p></div>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Actividad reciente</p>
                <div className="space-y-3">
                  {drawer.actividad.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.tipo === "ok" ? "bg-lime-500" : a.tipo === "warn" ? "bg-amber-400" : "bg-gray-300"}`} />
                      <div><p className="text-xs text-gray-700">{a.desc}</p><p className="text-[10px] text-gray-400">{a.tiempo}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0 flex gap-2">
              <button onClick={() => { setShowPass(false); setCredModal(drawer); setDrawer(null); }} className="flex-1 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition-colors">Credenciales</button>
              <button onClick={() => setDrawer(null)} className="flex-1 py-2 text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 rounded-lg font-medium transition-colors">Cerrar</button>
            </div>
          </aside>
        </>
      )}

      {/* Modal: credenciales */}
      {credModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setCredModal(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Credenciales de conexión">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Credenciales de conexión</h2>
              <button onClick={() => setCredModal(null)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5 mb-4">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <p className="text-xs text-amber-700">Mantén estas credenciales seguras. No las compartas ni las expongas en código fuente público.</p>
              </div>
              {([["Host", credModal.host], ["Puerto", credModal.puerto], ["Base de datos", credModal.baseDatos], ["Usuario", credModal.usuario]] as [string, string][]).map(([label, value]) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <span className="flex-1 text-sm text-gray-800 font-mono truncate">{value}</span>
                    <CopyBtn text={value} />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                  <span className="flex-1 text-sm text-gray-800 font-mono">{showPass ? credModal.password : "••••••••••••"}</span>
                  <button onClick={() => setShowPass(p => !p)} aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"} className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} /></svg>
                  </button>
                  <CopyBtn text={credModal.password} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setCredModal(null)} className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg text-sm transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6" role="dialog" aria-modal="true" aria-label="Confirmar eliminación">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Eliminar instancia</h2>
            <p className="text-sm text-gray-500 mb-1">{"¿Seguro que deseas eliminar"} <span className="font-mono font-semibold text-gray-900">{deleteConfirm.nombre}</span>{"?"}</p>
            <p className="text-xs text-red-400 mb-6">Esta acción es irreversible. Se perderán todos los datos almacenados.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showCreate && <CreateInstanciaModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── CLIENTE: Vista Plantillas DB ─────────────────────────────────────────────

function ClientePlantillas() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("Todas");
  const [drawer, setDrawer] = useState<CPlantillaDB | null>(null);
  const [createModal, setCreateModal] = useState<string | null>(null);

  const categorias = ["Todas", ...Array.from(new Set(C_PLANTILLAS.map(p => p.categoria)))];

  const filtered = C_PLANTILLAS.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) || p.descripcion.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "Todas" || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Plantillas DB</h1>
        <p className="text-sm text-gray-500 mt-1">Schemas PostgreSQL preconfigurados para el sector agrícola. Úsalos al crear una nueva instancia.</p>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plantilla..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCatFilter(cat)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${catFilter === cat ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">No hay plantillas que coincidan con tu búsqueda.</p>
          <button onClick={() => { setSearch(""); setCatFilter("Todas"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className={`grid gap-4 ${drawer ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
          {filtered.map(plantilla => (
            <div key={plantilla.id} onClick={() => setDrawer(drawer?.id === plantilla.id ? null : plantilla)}
              className={`bg-white border rounded-xl p-5 cursor-pointer transition-all hover:shadow-sm ${drawer?.id === plantilla.id ? "border-lime-300 ring-1 ring-lime-100" : "border-gray-100 hover:border-gray-200"}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <SvgPaths d={plantilla.icon} className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium shrink-0">{plantilla.categoria}</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{plantilla.nombre}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{plantilla.descripcion}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{plantilla.tablas} tablas</span>
                <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 border border-lime-200 px-2 py-0.5 rounded-full">Disponible</span>
              </div>
              <button onClick={e => { e.stopPropagation(); setDrawer(plantilla); }}
                className="w-full py-2 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Ver detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drawer: detalle de plantilla */}
      {drawer && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDrawer(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" aria-label="Detalle de plantilla">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <SvgPaths d={drawer.icon} className="w-5 h-5 text-gray-500" />
                </div>
                <div><p className="text-sm font-semibold text-gray-900">{drawer.nombre}</p><p className="text-[10px] text-gray-400">{drawer.categoria}</p></div>
              </div>
              <button onClick={() => setDrawer(null)} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-lime-100 text-lime-700 border border-lime-200 px-2 py-0.5 rounded-full">Disponible</span>
                <span className="text-xs text-gray-400">{drawer.tablas} tablas · PostgreSQL 14+</span>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</p>
                <p className="text-sm text-gray-600 leading-relaxed">{drawer.descripcion}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Entidades incluidas</p>
                <div className="flex flex-wrap gap-1.5">
                  {drawer.entidades.map(e => <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{e}</span>)}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Casos de uso</p>
                <ul className="space-y-2">
                  {drawer.casosDeUso.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-700 mb-1">Compatibilidad</p>
                <p className="text-xs text-gray-500 leading-relaxed">PostgreSQL 14 o superior. Compatible con el plan Productor y todos los planes superiores.</p>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => { setCreateModal(drawer.nombre); setDrawer(null); }}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-sm transition-colors">
                Usar plantilla
              </button>
            </div>
          </aside>
        </>
      )}

      {createModal !== null && <CreateInstanciaModal onClose={() => setCreateModal(null)} plantillaInicial={createModal} />}
    </div>
  );
}

// ─── CLIENTE: Plan y suscripción ─────────────────────────────────────────────

function ClientePlan() {
  const storageUsed = 32;
  const storageTotal = 50;
  const instUsed = 2;
  const instTotal = 2;

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Plan y suscripción</h1>
        <p className="text-sm text-gray-500 mt-1">Información de tu plan activo y método de pago registrado.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Plan card */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">Plan Productor</h2>
                <p className="text-xs text-gray-400">Finca Los Pinos</p>
              </div>
            </div>
            <StatusBadge s="Activa" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: "Precio mensual", value: "Q 60.00" },
              { label: "Ciclo de facturación", value: "Mensual" },
              { label: "Inicio del plan", value: "01 ago 2026" },
              { label: "Próximo cobro", value: "01 oct 2026" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Resource usage */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Recursos incluidos y uso actual</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Almacenamiento</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{storageUsed} <span className="text-gray-400 font-normal">/ {storageTotal} GB</span></span>
                </div>
                <ProgressBar value={(storageUsed / storageTotal) * 100} color="bg-blue-400" />
                <p className="text-[10px] text-gray-400 mt-1.5">{storageTotal - storageUsed} GB disponibles</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Instancias</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{instUsed} <span className="text-gray-400 font-normal">/ {instTotal} permitidas</span></span>
                </div>
                <ProgressBar value={(instUsed / instTotal) * 100} color="bg-amber-400" />
                <p className="text-[10px] text-amber-600 mt-1.5">Has alcanzado el límite de instancias de tu plan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Payment method */}
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="font-semibold text-gray-900 text-sm">Método de pago</h3>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-7 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blue-700 leading-none">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-[10px] text-gray-400">Tarjeta de crédito</p>
                </div>
              </div>
              <div className="space-y-2">
                {[["Titular", "Finca Los Pinos"], ["Vencimiento", "08/28"]].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className="text-xs text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">El método de pago solo puede modificarse contactando al soporte de AgroCloud.</p>
          </div>

          {/* Auto-renewal notice */}
          <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 flex gap-3">
            <svg className="w-4 h-4 text-lime-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-lime-800 mb-0.5">Renovación automática activa</p>
              <p className="text-[10px] text-lime-700 leading-relaxed">Tu suscripción se renueva automáticamente cada mes. El próximo cargo de Q 60.00 se realizará el 01 oct 2026 al método de pago registrado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENTE: Pagos ───────────────────────────────────────────────────────────

interface Pago {
  id: string; fecha: string; concepto: string; periodo: string;
  monto: number; metodo: string; referencia: string; estado: "Pagado";
}

const PAGOS_MOCK: Pago[] = [
  { id: "PAG-006", fecha: "9 de septiembre 2026", concepto: "Plan Productor", periodo: "sep 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260901-8821", estado: "Pagado" },
  { id: "PAG-005", fecha: "2026-08-01", concepto: "Plan Productor", periodo: "ago 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260801-7714", estado: "Pagado" },
  { id: "PAG-004", fecha: "2026-07-01", concepto: "Plan Productor", periodo: "jul 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260701-6603", estado: "Pagado" },
  { id: "PAG-003", fecha: "2026-06-01", concepto: "Plan Productor", periodo: "jun 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260601-5541", estado: "Pagado" },
  { id: "PAG-002", fecha: "2026-05-01", concepto: "Plan Productor", periodo: "may 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260501-4430", estado: "Pagado" },
  { id: "PAG-001", fecha: "2026-04-01", concepto: "Plan Productor", periodo: "abr 2026", monto: 60, metodo: "Visa •••• 4242", referencia: "TXN-20260401-3319", estado: "Pagado" },
];

function PagoDetalleDrawer({ pago, onClose }: { pago: Pago; onClose: () => void }) {
  const subtotal = pago.monto;
  const impuesto = 0;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col" role="dialog" aria-label="Detalle del pago">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="font-semibold text-gray-900">{pago.id}</p>
            <p className="text-[10px] text-gray-400">{pago.referencia}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar panel" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-700 border border-lime-300">Pagado</span>
            <span className="text-xs text-gray-400">{pago.fecha}</span>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Detalle del pago</p>
            <div className="space-y-2">
              {[
                ["Concepto", pago.concepto],
                ["Período facturado", pago.periodo],
                ["Método de pago", pago.metodo],
                ["Referencia", pago.referencia],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-gray-800 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Datos de facturación</p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-xs">
              {[["Razón social", "Finca Los Pinos"], ["NIT", "CF"], ["Dirección", "Guatemala, Guatemala"]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-700">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Desglose</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-800">Q {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Impuestos</span>
                <span className="text-gray-400">Q {impuesto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-sm">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">Q {(subtotal + impuesto).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl text-sm transition-colors">Cerrar</button>
        </div>
      </aside>
    </>
  );
}

function ClientePagos() {
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("2026");
  const [detalle, setDetalle] = useState<Pago | null>(null);

  const years = ["2026", "2025"];

  const filtered = PAGOS_MOCK.filter(p => {
    const matchSearch =
      p.referencia.toLowerCase().includes(search.toLowerCase()) ||
      p.concepto.toLowerCase().includes(search.toLowerCase()) ||
      p.periodo.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchYear = p.fecha.startsWith(yearFilter);
    return matchSearch && matchYear;
  });

  const totalAnio = PAGOS_MOCK.filter(p => p.fecha.startsWith(yearFilter)).reduce((s, p) => s + p.monto, 0);
  const ultimoPago = PAGOS_MOCK[0];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Pagos</h1>
        <p className="text-sm text-gray-500 mt-1">Consulta el historial de pagos de tu suscripción.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "TOTAL PAGADO EN 2026", value: `Q ${totalAnio.toFixed(2)}`, sub: "Pagos realizados durante el año", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", color: "text-lime-600 bg-lime-50" },
          { label: "ÚLTIMO PAGO", value: `Q ${ultimoPago.monto.toFixed(2)}`, sub: ultimoPago.fecha, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-blue-500 bg-blue-50" },
          { label: "MÉTODO USADO", value: "Visa •••• 4242", sub: "Tarjeta de crédito", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "text-purple-500 bg-purple-50" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}
                </svg>
              </div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative max-w-xs flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por referencia, concepto o período..."
            aria-label="Buscar pagos"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400" />
        </div>
        <div className="flex gap-1.5">
          {years.map(y => (
            <button key={y} onClick={() => setYearFilter(y)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${yearFilter === y ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-16 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <p className="text-sm font-medium text-gray-700">Sin resultados</p>
          <p className="text-xs text-gray-400 mt-1">No se encontraron pagos con los filtros actuales.</p>
          <button onClick={() => { setSearch(""); setYearFilter("2026"); }} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar filtros</button>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
          <table className="min-w-max w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["ID", "Fecha", "Concepto / Período", "Monto", "Método", "Referencia", "Estado", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(pago => (
                <tr key={pago.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{pago.id}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{pago.fecha}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="text-xs font-medium text-gray-800">{pago.concepto}</p>
                    <p className="text-[10px] text-gray-400">{pago.periodo}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">Q {pago.monto.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap font-mono">{pago.metodo}</td>
                  <td className="px-4 py-3.5 text-[10px] text-gray-400 font-mono whitespace-nowrap">{pago.referencia}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-700 border border-lime-300">Pagado</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap flex justify-center">
                    <button onClick={() => setDetalle(pago)} className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Ver recibo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">{filtered.length} registro{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</div>
        </div>
      )}

      {detalle && <PagoDetalleDrawer pago={detalle} onClose={() => setDetalle(null)} />}
    </div>
  );
}

// ─── CLIENTE: Soporte ─────────────────────────────────────────────────────────

type TicketEstado = "Abierta" | "En proceso" | "Resuelta";
type TicketPrioridad = "Alta" | "Media" | "Baja";

interface TicketComentario {
  autor: "cliente" | "soporte";
  texto: string;
  fecha: string;
}

interface Ticket {
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

const TICKETS_INIT: Ticket[] = [
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

function ClienteSoporte() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_INIT);
  const [search, setSearch] = useState("");
  const [detalle, setDetalle] = useState<Ticket | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [confirmacion, setConfirmacion] = useState("");

  const [form, setForm] = useState({ asunto: "", instancia: "", categoria: "", prioridad: "Media" as TicketPrioridad, descripcion: "" });
  const [formErr, setFormErr] = useState<Partial<typeof form>>({});

  const reciente = tickets[0] ?? null;

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    return t.id.toLowerCase().includes(q) || t.asunto.toLowerCase().includes(q);
  });

  const estadoColor = (e: TicketEstado) =>
    e === "Resuelta"   ? "bg-lime-100 text-lime-700 border border-lime-300"
    : e === "En proceso" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : "bg-blue-50 text-blue-600 border border-blue-200";

  function validar() {
    const err: Partial<typeof form> = {};
    if (!form.asunto.trim())      err.asunto      = "El asunto es obligatorio.";
    if (!form.instancia)          err.instancia   = "Selecciona una instancia.";
    if (!form.categoria)          err.categoria   = "Selecciona una categoría.";
    if (!form.descripcion.trim()) err.descripcion = "Describe el problema.";
    setFormErr(err);
    return Object.keys(err).length === 0;
  }

  function enviarTicket() {
    if (!validar()) return;
    const nuevo: Ticket = {
      id: `INC-${String(Math.floor(Math.random() * 900) + 100)}`,
      asunto: form.asunto, instancia: form.instancia, categoria: form.categoria,
      prioridad: form.prioridad, estado: "Abierta",
      descripcion: form.descripcion, creado: "2026-09-06", actualizado: "2026-09-06",
      historial: [{ autor: "cliente", texto: form.descripcion, fecha: "2026-09-06 12:00" }],
    };
    setTickets(prev => [nuevo, ...prev]);
    setShowNew(false);
    setForm({ asunto: "", instancia: "", categoria: "", prioridad: "Media", descripcion: "" });
    setFormErr({});
    setConfirmacion(`Incidencia ${nuevo.id} registrada correctamente. El equipo de soporte la revisará a la brevedad.`);
    setTimeout(() => setConfirmacion(""), 5000);
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Soporte</h1>
          <p className="text-sm text-gray-500 mt-1">Reporta un problema técnico o consulta el estado de tus incidencias.</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva incidencia
        </button>
      </div>

      {/* Confirmación de envío */}
      {confirmacion && (
        <div className="mb-6 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm text-lime-800">{confirmacion}</span>
        </div>
      )}

      {/* Tarjeta: incidencia más reciente */}
      {reciente && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Estado de mi incidencia más reciente</h2>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-sm font-semibold text-gray-900">{reciente.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(reciente.estado)}`}>{reciente.estado}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 leading-snug">{reciente.asunto}</p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-400">
                    <span>Instancia: <span className="font-mono text-gray-600">{reciente.instancia}</span></span>
                    <span>Última actualización: <span className="text-gray-600">{reciente.actualizado}</span></span>
                    <span>Registrada: <span className="text-gray-600">{reciente.creado}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => setDetalle(reciente)}
                className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shrink-0">
                Ver detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historial de incidencias */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-700">Historial de incidencias</h2>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por ID o asunto..."
              aria-label="Buscar incidencias"
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 w-60" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-xl p-14 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">Sin resultados</p>
            <p className="text-xs text-gray-400 mt-1">Ninguna incidencia coincide con tu búsqueda.</p>
            <button onClick={() => setSearch("")} className="mt-4 text-xs text-lime-600 hover:text-lime-700 font-medium">Limpiar búsqueda</button>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto">
            <table className="min-w-max w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["ID", "Fecha", "Asunto", "Instancia", "Estado", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-center text-gray-400 font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors text-center">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-900 whitespace-nowrap">{t.id}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">{t.creado}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-800 whitespace-nowrap max-w-[240px] truncate mx-auto">{t.asunto}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono whitespace-nowrap">{t.instancia}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap flex justify-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(t.estado)}`}>{t.estado}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button onClick={() => setDetalle(t)}
                        className="px-2.5 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mx-auto flex">
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 text-xs text-gray-400 border-t border-gray-50">
              {filtered.length} incidencia{filtered.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Drawer: detalle informativo del ticket */}
      {detalle && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDetalle(null)} aria-hidden="true" />
          <aside className="fixed inset-y-0 right-0 w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
            role="dialog" aria-label="Detalle de incidencia">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between shrink-0">
              <div className="min-w-0">
                <p className="font-mono font-semibold text-gray-900">{detalle.id}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{detalle.asunto}</p>
              </div>
              <button onClick={() => setDetalle(null)} aria-label="Cerrar panel"
                className="text-gray-400 hover:text-gray-600 text-xl leading-none ml-4 shrink-0">×</button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              {/* Badges de estado */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${estadoColor(detalle.estado)}`}>{detalle.estado}</span>
                <span className="text-xs text-gray-400">· {detalle.instancia}</span>
              </div>

              {/* Datos del ticket */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Datos de la incidencia</p>
                <div className="space-y-2">
                  {[
                    ["Categoría",         detalle.categoria],
                    ["Registrada",        detalle.creado],
                    ["Última actualización", detalle.actualizado],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-gray-400">{k}</span>
                      <span className="text-gray-800 font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Descripción</p>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 border border-gray-100 rounded-xl p-3">{detalle.descripcion}</p>
              </div>

              {/* Cronología */}
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Cronología</p>
                <div className="space-y-4">
                  {detalle.historial.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold
                        ${h.autor === "cliente" ? "bg-lime-100 text-lime-700" : "bg-blue-100 text-blue-700"}`}>
                        {h.autor === "cliente" ? "FL" : "ST"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-gray-700">
                            {h.autor === "cliente" ? "Finca Los Pinos" : "Soporte AgroCloud"}
                          </span>
                          <span className="text-[10px] text-gray-400">{h.fecha}</span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{h.texto}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 shrink-0">
              <button onClick={() => setDetalle(null)}
                className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors">
                Cerrar
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Modal: nueva incidencia */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowNew(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" role="dialog" aria-modal="true" aria-label="Nueva incidencia">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Nueva incidencia</h2>
              <button onClick={() => setShowNew(false)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="sop-asunto" className="block text-xs font-medium text-gray-600 mb-1.5">Asunto <span className="text-red-400">*</span></label>
                <input id="sop-asunto" value={form.asunto}
                  onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                  placeholder="Describe brevemente el problema"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${formErr.asunto ? "border-red-300" : "border-gray-200"}`} />
                {formErr.asunto && <p className="text-[10px] text-red-500 mt-1">{formErr.asunto}</p>}
              </div>
              <div>
                <label htmlFor="sop-inst" className="block text-xs font-medium text-gray-600 mb-1.5">Instancia asociada <span className="text-red-400">*</span></label>
                <select id="sop-inst" value={form.instancia}
                  onChange={e => setForm(f => ({ ...f, instancia: e.target.value }))}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white ${formErr.instancia ? "border-red-300" : "border-gray-200"}`}>
                  <option value="">Seleccionar instancia...</option>
                  {C_INSTANCIAS.map(i => <option key={i.nombre} value={i.nombre}>{i.nombre}</option>)}
                </select>
                {formErr.instancia && <p className="text-[10px] text-red-500 mt-1">{formErr.instancia}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sop-cat" className="block text-xs font-medium text-gray-600 mb-1.5">Categoría <span className="text-red-400">*</span></label>
                  <select id="sop-cat" value={form.categoria}
                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white ${formErr.categoria ? "border-red-300" : "border-gray-200"}`}>
                    <option value="">Seleccionar...</option>
                    {["Conectividad", "Rendimiento", "Datos", "Plan", "Acceso", "Otro"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErr.categoria && <p className="text-[10px] text-red-500 mt-1">{formErr.categoria}</p>}
                </div>
                <div>
                  <label htmlFor="sop-prio" className="block text-xs font-medium text-gray-600 mb-1.5">Prioridad</label>
                  <select id="sop-prio" value={form.prioridad}
                    onChange={e => setForm(f => ({ ...f, prioridad: e.target.value as TicketPrioridad }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-white">
                    {["Alta", "Media", "Baja"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="sop-desc" className="block text-xs font-medium text-gray-600 mb-1.5">Descripción del problema <span className="text-red-400">*</span></label>
                <textarea id="sop-desc" value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el problema con el mayor detalle posible..."
                  rows={4}
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none ${formErr.descripcion ? "border-red-300" : "border-gray-200"}`} />
                {formErr.descripcion && <p className="text-[10px] text-red-500 mt-1">{formErr.descripcion}</p>}
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setShowNew(false); setFormErr({}); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={enviarTicket}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm transition-colors">
                Enviar incidencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENTE: Configuración ───────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer gap-4">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-lime-400 ${checked ? "bg-lime-400" : "bg-gray-200"}`}
        style={{ height: "22px", width: "40px" }}
      >
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
          style={{ width: "18px", height: "18px" }} />
      </button>
    </label>
  );
}

function ClienteConfiguracion() {
  const [perfil, setPerfil] = useState({ nombre: "Carlos Monterroso", correo: "carlos@fincalospinos.gt", telefono: "+502 4455 6677", nit: "1234567-8" });
  const [perfilEdit, setPerfilEdit] = useState({ ...perfil });
  const [perfilDirty, setPerfilDirty] = useState(false);
  const [perfilOk, setPerfilOk] = useState(false);

  const [notifs, setNotifs] = useState({ instancias: true, pagos: true, incidencias: false });

  const [showPassModal, setShowPassModal] = useState(false);
  const [passForm, setPassForm] = useState({ actual: "", nueva: "", confirmar: "" });
  const [passErr, setPassErr] = useState<Partial<typeof passForm>>({});
  const [passOk, setPassOk] = useState(false);

  function handlePerfilChange(field: keyof typeof perfilEdit, value: string) {
    setPerfilEdit(p => ({ ...p, [field]: value }));
    setPerfilDirty(true);
    setPerfilOk(false);
  }

  function guardarPerfil() {
    setPerfil(perfilEdit);
    setPerfilDirty(false);
    setPerfilOk(true);
    setTimeout(() => setPerfilOk(false), 3000);
  }

  function validarPass() {
    const err: Partial<typeof passForm> = {};
    if (!passForm.actual) err.actual = "Ingresa tu contraseña actual.";
    if (passForm.nueva.length < 8) err.nueva = "Mínimo 8 caracteres.";
    if (passForm.nueva !== passForm.confirmar) err.confirmar = "Las contraseñas no coinciden.";
    setPassErr(err);
    return Object.keys(err).length === 0;
  }

  function cambiarPass() {
    if (!validarPass()) return;
    setPassOk(true);
    setShowPassModal(false);
    setPassForm({ actual: "", nueva: "", confirmar: "" });
    setPassErr({});
    setTimeout(() => setPassOk(false), 4000);
  }

  const sectionHead = (title: string, subtitle: string) => (
    <div className="mb-5">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-1">Administra el perfil, preferencias y seguridad de tu cuenta.</p>
      </div>

      {passOk && (
        <div className="mb-5 bg-lime-50 border border-lime-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-4 h-4 text-lime-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm text-lime-800 font-medium">Contraseña actualizada correctamente.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Perfil */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            {sectionHead("Perfil y organización", "Información de tu cuenta y datos de contacto.")}

            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full bg-lime-600 flex items-center justify-center text-white text-lg font-bold shrink-0">FL</div>
              <div>
                <p className="font-semibold text-gray-900">Finca Los Pinos</p>
                <p className="text-xs text-gray-400">Organización · Plan Productor</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              {([
                { id: "cfg-nombre", label: "Nombre de contacto", field: "nombre" as const },
                { id: "cfg-tel", label: "Teléfono", field: "telefono" as const },
                { id: "cfg-nit", label: "NIT / Identificación fiscal", field: "nit" as const },
              ] as { id: string; label: string; field: keyof typeof perfilEdit }[]).map(f => (
                <div key={f.id} className={f.field === "nit" ? "col-span-2" : ""}>
                  <label htmlFor={f.id} className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input id={f.id} value={perfilEdit[f.field]} onChange={e => handlePerfilChange(f.field, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo electrónico</label>
                <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-500 select-none">{perfilEdit.correo}</div>
                <p className="text-[10px] text-gray-400 mt-1">El correo de contacto no puede modificarse directamente. Contacta a soporte si necesitas cambiarlo.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={guardarPerfil} disabled={!perfilDirty}
                className="px-4 py-2 bg-lime-400 hover:bg-lime-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-medium rounded-lg text-sm transition-colors">
                Guardar cambios
              </button>
              {perfilDirty && <span className="text-xs text-amber-600 font-medium">Cambios sin guardar</span>}
              {perfilOk && !perfilDirty && <span className="text-xs text-lime-600 font-medium flex items-center gap-1"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Guardado</span>}
            </div>
          </div>

          {/* Preferencias */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            {sectionHead("Preferencias y Estado", "Configuración de notificaciones y resumen de tu cuenta.")}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan Actual</p>
                <p className="text-sm font-medium text-gray-900">Plan Productor</p>
                <p className="text-xs text-gray-500 mt-1">Suscripción activa. Renueva el 1 de oct 2026.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Recursos Utilizados</p>
                <p className="text-sm font-medium text-gray-900">2 de 2 Instancias</p>
                <p className="text-xs text-gray-500 mt-1">32 GB de 50 GB en almacenamiento.</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notificaciones por correo</p>
              <Toggle checked={notifs.instancias} onChange={v => setNotifs(n => ({ ...n, instancias: v }))} label="Estado de instancias" />
              <Toggle checked={notifs.pagos} onChange={v => setNotifs(n => ({ ...n, pagos: v }))} label="Pagos y suscripción" />
              <Toggle checked={notifs.incidencias} onChange={v => setNotifs(n => ({ ...n, incidencias: v }))} label="Actualizaciones de incidencias" />
            </div>
          </div>

        </div>

        {/* Right column: Seguridad + aviso */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            {sectionHead("Seguridad", "Contraseña y acceso a tu cuenta.")}

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Correo de acceso</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-500 select-none">carlos@fincalospinos.gt</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Contraseña</label>
                <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5 text-sm text-gray-400 font-mono tracking-widest select-none">••••••••••••</div>
              </div>
            </div>

            <button onClick={() => setShowPassModal(true)}
              className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-sm transition-colors">
              Cambiar contraseña
            </button>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex gap-3">
            <svg className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Sesión segura</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">Tu sesión está protegida mediante HTTPS. Si detectas actividad inusual, cambia tu contraseña y contacta a soporte.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: cambiar contraseña */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowPassModal(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" role="dialog" aria-modal="true" aria-label="Cambiar contraseña">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Cambiar contraseña</h2>
              <button onClick={() => setShowPassModal(false)} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {([
                { id: "pass-actual", label: "Contraseña actual", field: "actual" as const },
                { id: "pass-nueva", label: "Nueva contraseña", field: "nueva" as const },
                { id: "pass-conf", label: "Confirmar nueva contraseña", field: "confirmar" as const },
              ] as { id: string; label: string; field: keyof typeof passForm }[]).map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-medium text-gray-600 mb-1.5">{f.label}</label>
                  <input id={f.id} type="password" value={passForm[f.field]} onChange={e => setPassForm(p => ({ ...p, [f.field]: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${passErr[f.field] ? "border-red-300" : "border-gray-200"}`} />
                  {passErr[f.field] && <p className="text-[10px] text-red-500 mt-1">{passErr[f.field]}</p>}
                </div>
              ))}
              <p className="text-[10px] text-gray-400">La contraseña debe tener al menos 8 caracteres.</p>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setShowPassModal(false); setPassErr({}); setPassForm({ actual: "", nueva: "", confirmar: "" }); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button onClick={cambiarPass} className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm transition-colors">Actualizar contraseña</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENTE PANEL ────────────────────────────────────────────────────────────

function ClientePanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<ClientePage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageLabels: Record<ClientePage, string> = { dashboard: "Panel de Control", instancias: "Instancias", plantillas: "Plantillas DB", plan: "Plan y suscripción", pagos: "Pagos", soporte: "Soporte", configuracion: "Configuración", documentacion: "Documentación" };
  const navigate = (p: ClientePage) => { setPage(p); setSidebarOpen(false); };
  return (
    <div className="flex h-full">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-52 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "#0e1a0c" }}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <LogoIcon />
          <span className="text-white font-semibold text-sm flex-1">AgroCloud</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          {clienteNav.map(item => (
            <div key={item.page}>
              {item.section && <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-2 pt-4 pb-1.5">{item.section}</p>}
              <button onClick={() => navigate(item.page)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === item.page ? "bg-lime-400 text-gray-900" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">FL</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">Finca Los Pinos</p>
              <p className="text-white/40 text-[10px]">Plan Productor</p>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-lime-400" /><span className="text-[10px] text-white/40">Servicio activo</span></div>
            <button onClick={onLogout} className="text-[10px] text-white/30 hover:text-white/60">Salir</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm text-gray-500 flex-1 truncate">{pageLabels[page]}</span>
          <div className="relative hidden md:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input placeholder="Buscar en AgroCloud" className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-400 w-52" />
          </div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold">FL</div>
            <div><p className="text-xs font-medium text-gray-800 leading-none">Finca Los Pinos</p><p className="text-[10px] text-gray-400">Cliente</p></div>
          </div>
        </header>
        {page === "dashboard" && <ClienteDashboard />}
        {page === "instancias" && <ClienteInstancias />}
        {page === "plantillas" && <ClientePlantillas />}
        {page === "plan" && <ClientePlan />}
        {page === "pagos" && <ClientePagos />}
        {page === "soporte" && <ClienteSoporte />}
        {page === "configuracion" && <ClienteConfiguracion />}
        {page === "documentacion" && <SharedDocumentacion />}
      </div>
    </div>
  );
}

// ─── SOPORTE PANEL ────────────────────────────────────────────────────────────

const soporteNav = [
  { page: "dashboard" as SoportePage, label: "Dashboard", section: "PRINCIPAL", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { page: "incidencias" as SoportePage, label: "Incidencias", section: "SOPORTE", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" },
  { page: "instancias" as SoportePage, label: "Instancias", section: null, icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
  { page: "actividad" as SoportePage, label: "Actividad", section: null, icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { page: "documentacion" as SoportePage, label: "Documentación", section: "RECURSOS", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { page: "configuracion" as SoportePage, label: "Configuración", section: "SISTEMA", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function SoporteDashboard({ setPage }: { setPage: (p: SoportePage) => void }) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4">
        <div><h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Panel de soporte</h1><p className="text-sm text-gray-500 mt-1">Gestiona incidencias y revisa el estado técnico de las instancias.</p></div>
        <button onClick={() => setPage("incidencias")} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-3 lg:px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva incidencia</span>
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Incidencias abiertas", value: "12", sub: "Pendientes de atención", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: "text-blue-500 bg-blue-50" },
          { label: "En revisión", value: "5", sub: "Atención técnica activa", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-orange-500 bg-orange-50" },
          { label: "Resueltas", value: "28", sub: "Esta semana", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-lime-600 bg-lime-50" },
          { label: "Con incidencias", value: "4", sub: "Instancias afectadas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: "text-gray-500 bg-gray-100" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-100 rounded-xl p-5 text-left flex flex-col items-start">
            <div className="flex items-center justify-start gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{k.label}</span>
            </div>
            <div className="text-3xl font-semibold text-gray-900">{k.value}</div>
            <div className="text-xs text-gray-400 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl">
          <div className="p-5 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Incidencias recientes</h2><p className="text-xs text-gray-400 mt-0.5">Solicitudes que necesitan seguimiento técnico.</p></div>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-100">{["ID", "Cliente", "Instancia", "Plantilla", "Asunto", "Prior.", "Estado"].map(h => <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium uppercase tracking-wide text-[10px]">{h}</th>)}</tr></thead>
            <tbody>{incidents.slice(0, 3).map(inc => (
              <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-900">{inc.id}</td>
                <td className="px-5 py-4 text-gray-600">{inc.cliente}</td>
                <td className="px-5 py-4 text-gray-500 font-mono text-[10px]">{inc.instancia}</td>
                <td className="px-5 py-4 text-gray-600">{inc.plantilla}</td>
                <td className="px-5 py-4 text-gray-600">{inc.asunto}</td>
                <td className="px-5 py-4"><PriorityBadge p={inc.prioridad} /></td>
                <td className="px-5 py-4"><StatusBadge s={inc.estado} /></td>
              </tr>
            ))}</tbody>
          </table>
          <div className="px-5 py-3 text-center text-xs text-gray-400">12 incidencias abiertas · 5 actualmente en revisión</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div><h2 className="font-semibold text-gray-900">Prioridades</h2><p className="text-xs text-gray-400 mt-0.5">Incidencias críticas activas.</p></div>
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">{incidents.filter(i => i.prioridad === "Alta" && i.estado !== "Resuelta").length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {incidents.filter(i => i.prioridad === "Alta" && i.estado !== "Resuelta").map(inc => (
              <div key={inc.id} className="p-4 flex items-start gap-3 hover:bg-red-50/40 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-mono text-xs font-semibold text-gray-900">{inc.id}</span>
                    <StatusBadge s={inc.estado} />
                  </div>
                  <p className="text-xs text-gray-700 truncate">{inc.asunto}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{inc.cliente}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div><h2 className="font-semibold text-gray-900">Estado técnico de instancias</h2><p className="text-xs text-gray-400 mt-0.5">Contexto operativo para atender las incidencias activas.</p></div>
          <button onClick={() => setPage("instancias")} className="text-xs text-lime-600 hover:text-lime-700 font-medium">Ver instancias →</button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {instances.slice(0, 3).map(inst => (
            <div key={inst.nombre} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-lime-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                </div>
                <div><p className="text-xs font-medium text-gray-900 font-mono">{inst.nombre}</p><p className="text-[10px] text-gray-400">{inst.cliente}</p></div>
              </div>
              <StatusBadge s={inst.estado} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SoporteIncidencias() {
  const [filter, setFilter] = useState<"todas" | "Abierta" | "En revisión" | "Resuelta">("todas");
  const [selected, setSelected] = useState<Incident | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cliente: "", instancia: "", plantilla: "", asunto: "", problema: "", guia: "", prioridad: "Media" as Incident["prioridad"] });
  const filtered = filter === "todas" ? incidents : incidents.filter(i => i.estado === filter);
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-8">
        <div><h1 className="text-2xl font-semibold text-gray-900">Incidencias</h1><p className="text-sm text-gray-500 mt-1">Registro de todas las incidencias enviadas por los clientes.</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nueva incidencia
        </button>
      </div>
      <div className="flex gap-2 mb-6">
        {(["todas", "Abierta", "En revisión", "Resuelta"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div className="flex gap-6">
        <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden ${selected ? "flex-1" : "w-full"}`}>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50">{["ID", "Cliente", "Instancia", "Asunto", "Prioridad", "Estado", "Fecha"].map(h => <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{filtered.map(inc => (
              <tr key={inc.id} onClick={() => setSelected(selected?.id === inc.id ? null : inc)} className={`border-b border-gray-50 cursor-pointer transition-colors ${selected?.id === inc.id ? "bg-lime-50" : "hover:bg-gray-50"}`}>
                <td className="px-5 py-4 font-medium text-gray-900">{inc.id}</td>
                <td className="px-5 py-4 text-gray-700">{inc.cliente}</td>
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">{inc.instancia}</td>
                <td className="px-5 py-4 text-gray-700">{inc.asunto}</td>
                <td className="px-5 py-4"><PriorityBadge p={inc.prioridad} /></td>
                <td className="px-5 py-4"><StatusBadge s={inc.estado} /></td>
                <td className="px-5 py-4 text-gray-400 text-xs">{inc.fecha}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        {selected && (
          <div className="w-80 bg-white border border-gray-100 rounded-xl p-6 self-start shrink-0">
            <div className="flex items-center justify-between mb-4"><span className="font-mono text-sm font-semibold">{selected.id}</span><button onClick={() => setSelected(null)} className="text-gray-400">✕</button></div>
            <div className="space-y-4">
              {[["Cliente", selected.cliente], ["Instancia", selected.instancia], ["Plantilla", selected.plantilla], ["Asunto", selected.asunto]].map(([k, v]) => (
                <div key={k}><p className="text-xs text-gray-400 mb-0.5">{k}</p><p className="text-sm text-gray-800">{v}</p></div>
              ))}
              <div><p className="text-xs text-gray-400 mb-0.5">Problema</p><p className="text-sm text-gray-600 leading-relaxed">{selected.problema}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Guía</p><p className="text-sm text-gray-600 bg-lime-50 border border-lime-100 rounded-lg p-3">{selected.guia}</p></div>
              <div className="flex gap-2"><PriorityBadge p={selected.prioridad} /><StatusBadge s={selected.estado} /></div>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between"><h2 className="font-semibold text-gray-900">Nueva incidencia</h2><button onClick={() => setShowForm(false)} className="text-gray-400">✕</button></div>
            <div className="p-6 space-y-4">
              {[{ label: "Cliente", key: "cliente", placeholder: "Nombre del cliente" }, { label: "Instancia", key: "instancia", placeholder: "ej. agro-produccion-db" }, { label: "Plantilla", key: "plantilla", placeholder: "ej. Cosechas y producción" }, { label: "Asunto", key: "asunto", placeholder: "Resumen breve" }].map(({ label, key, placeholder }) => (
                <div key={key}><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label><input value={(form as Record<string, string>)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400" /></div>
              ))}
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Problema</label><textarea value={form.problema} onChange={e => setForm({ ...form, problema: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Guía</label><textarea value={form.guia} onChange={e => setForm({ ...form, guia: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 resize-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label><select value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value as Incident["prioridad"] })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"><option>Alta</option><option>Media</option><option>Baja</option></select></div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancelar</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm">Crear incidencia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SoporteInstancias() {
  const [view, setView] = useState<"grid" | "list">("list");
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-8">
        <div><h1 className="text-2xl font-semibold text-gray-900">Instancias</h1><p className="text-sm text-gray-500 mt-1">Verificación de todas las instancias activas del sistema.</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></button>
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[{ label: "Operativas", count: instances.filter(i => i.estado === "Operativa").length, color: "text-lime-600 bg-lime-50 border-lime-200" }, { label: "En revisión", count: instances.filter(i => i.estado === "En revisión").length, color: "text-amber-600 bg-amber-50 border-amber-200" }, { label: "Detenidas", count: instances.filter(i => i.estado === "Detenida").length, color: "text-red-600 bg-red-50 border-red-200" }].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}><span className="text-3xl font-semibold">{count}</span><span className="text-sm font-medium">{label}</span></div>
        ))}
      </div>
      {view === "list" ? (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="border-b border-gray-100 bg-gray-50">{["Instancia", "Cliente", "Tipo", "Versión", "Uptime", "CPU", "Memoria", "Región", "Estado"].map(h => <th key={h} className="px-5 py-3 text-left text-gray-400 font-medium text-xs uppercase tracking-wide">{h}</th>)}</tr></thead>
            <tbody>{instances.map(inst => (
              <tr key={inst.nombre} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-medium text-gray-900">{inst.nombre}</td>
                <td className="px-5 py-4 text-gray-700">{inst.cliente}</td>
                <td className="px-5 py-4 text-gray-500 text-xs">{inst.tipo}</td>
                <td className="px-5 py-4 text-gray-500 text-xs font-mono">{inst.version}</td>
                <td className="px-5 py-4 text-gray-700 text-xs">{inst.uptime}</td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className="text-xs text-gray-500 w-8 shrink-0">{inst.cpu}%</span></div></td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className="text-xs text-gray-500 w-8 shrink-0">{inst.memoria}%</span></div></td>
                <td className="px-5 py-4 text-gray-400 text-xs font-mono">{inst.region}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map(inst => (
            <div key={inst.nombre} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-lime-50 flex items-center justify-center"><svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <StatusBadge s={inst.estado} />
              </div>
              <p className="font-mono text-sm font-semibold text-gray-900 mb-0.5">{inst.nombre}</p>
              <p className="text-xs text-gray-400 mb-4">{inst.cliente}</p>
              <div className="space-y-2">
                <div><div className="flex justify-between text-xs text-gray-500 mb-1"><span>CPU</span><span>{inst.cpu}%</span></div><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
                <div><div className="flex justify-between text-xs text-gray-500 mb-1"><span>Memoria</span><span>{inst.memoria}%</span></div><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400"><span className="font-mono">{inst.version}</span><span>{inst.region}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SoporteActividad() {
  const [tab, setTab] = useState<"todas" | "pendientes" | "resueltas">("todas");
  const filtered = tab === "pendientes" ? activityLogs.filter(l => l.tipo !== "resuelta") : tab === "resueltas" ? activityLogs.filter(l => l.tipo === "resuelta") : activityLogs;
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8"><h1 className="text-2xl font-semibold text-gray-900">Actividad</h1><p className="text-sm text-gray-500 mt-1">Bitácora de incidencias resueltas y por resolver.</p></div>
      <div className="flex gap-2 mb-6">{(["todas", "pendientes", "resueltas"] as const).map(t => <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{t}</button>)}</div>
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-100" />
          <div className="space-y-6">
            {filtered.map(log => (
              <div key={log.id} className="flex items-start gap-4 relative">
                <div className="relative z-10 shrink-0"><ActivityIcon tipo={log.tipo} /></div>
                <div className="flex-1 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-sm text-gray-800 font-medium">{log.descripcion}</p><p className="text-xs font-mono text-lime-600 mt-1">{log.incidencia}</p></div>
                    <span className="text-xs text-gray-400 shrink-0">{log.tiempo}</span>
                  </div>
                  <div className="mt-2"><span className={`text-[10px] font-medium px-2 py-0.5 rounded capitalize ${log.tipo === "resuelta" ? "bg-lime-100 text-lime-700" : log.tipo === "abierta" ? "bg-orange-100 text-orange-700" : log.tipo === "asignada" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`}>{log.tipo}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SharedDocumentacion() {
  const archivos = [
    { titulo: "Manual de Uso del Sistema", descripcion: "Guía completa para operar todas las funcionalidades de AgroCloud, gestión de instancias y configuración.", formato: "PDF", size: "3.2 MB" },
    { titulo: "Instrucciones de Configuración", descripcion: "Paso a paso para configurar tu primera base de datos y conectarla con tus aplicaciones.", formato: "PDF", size: "1.5 MB" },
    { titulo: "Políticas de Soporte", descripcion: "Acuerdos de nivel de servicio (SLA), tiempos de respuesta y escalamiento de incidencias.", formato: "PDF", size: "800 KB" },
    { titulo: "Guía de Buenas Prácticas", descripcion: "Recomendaciones de seguridad y arquitectura para mantener el rendimiento de tus datos.", formato: "PDF", size: "2.1 MB" },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Documentación y Descargas</h1>
        <p className="text-sm text-gray-500 mt-1">Archivos de documentación, guías de uso e instrucciones del sistema.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {archivos.map((a, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col items-start hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-lime-50 text-lime-600 flex items-center justify-center mb-4">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{a.titulo}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed flex-1">{a.descripcion}</p>
            <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{a.formato} · {a.size}</span>
              <button className="text-xs font-medium text-lime-600 hover:text-lime-700 transition-colors flex items-center gap-1">
                Descargar
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-3 3m0 0l-3-3m3 3V4" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SoporteConfiguracion() {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [localInst, setLocalInst] = useState(instances.map(i => ({ ...i, alertaCpu: 80, alertaMemoria: 80, notificaciones: true, backupAuto: true, intervalo: "diario" })));
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="mb-8"><h1 className="text-2xl font-semibold text-gray-900">Configuración</h1><p className="text-sm text-gray-500 mt-1">Configuración individual de cada instancia de cliente.</p></div>
      <div className="space-y-4">
        {localInst.map((inst, idx) => (
          <div key={inst.nombre} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setEditIdx(editIdx === idx ? null : idx)}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-lime-50 flex items-center justify-center"><svg className="w-5 h-5 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <div><p className="font-mono text-sm font-semibold text-gray-900">{inst.nombre}</p><p className="text-xs text-gray-400">{inst.cliente} · {inst.tipo} · {inst.version}</p></div>
              </div>
              <div className="flex items-center gap-3"><StatusBadge s={inst.estado} /><svg className={`w-4 h-4 text-gray-400 transition-transform ${editIdx === idx ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
            </div>
            {editIdx === idx && (
              <div className="border-t border-gray-100 p-5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Alertas de recursos</h3>
                    <div className="space-y-4">
                      <div><label className="flex justify-between text-xs text-gray-600 mb-2"><span>Umbral CPU (%)</span><span className="font-mono font-semibold text-gray-900">{inst.alertaCpu}%</span></label><input type="range" min={50} max={100} value={inst.alertaCpu} onChange={e => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, alertaCpu: +e.target.value } : x))} className="w-full accent-lime-500" /></div>
                      <div><label className="flex justify-between text-xs text-gray-600 mb-2"><span>Umbral memoria (%)</span><span className="font-mono font-semibold text-gray-900">{inst.alertaMemoria}%</span></label><input type="range" min={50} max={100} value={inst.alertaMemoria} onChange={e => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, alertaMemoria: +e.target.value } : x))} className="w-full accent-lime-500" /></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Notificaciones y respaldo</h3>
                    <div className="space-y-4">
                      {[["notificaciones", "Notificaciones activas"] as const, ["backupAuto", "Backup automático"] as const].map(([key, label]) => (
                        <label key={key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">{label}</span>
                          <button onClick={() => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, [key]: !x[key] } : x))} className={`relative w-10 h-5 rounded-full transition-colors ${inst[key] ? "bg-lime-400" : "bg-gray-200"}`}><span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${inst[key] ? "translate-x-5" : ""}`} /></button>
                        </label>
                      ))}
                      <div><label className="block text-xs text-gray-600 mb-1.5">Intervalo de backup</label><select value={inst.intervalo} onChange={e => setLocalInst(p => p.map((x, i) => i === idx ? { ...x, intervalo: e.target.value } : x))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"><option value="horario">Horario</option><option value="diario">Diario</option><option value="semanal">Semanal</option></select></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end"><button className="px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium rounded-lg text-sm transition-colors">Guardar cambios</button></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SoportePanel({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<SoportePage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pageLabels: Record<SoportePage, string> = { dashboard: "Panel de Soporte", incidencias: "Incidencias", instancias: "Instancias", actividad: "Actividad", documentacion: "Documentación", configuracion: "Configuración" };
  const navigate = (p: SoportePage) => { setPage(p); setSidebarOpen(false); };
  return (
    <div className="flex h-full">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-52 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`} style={{ background: "#0e1a0c" }}>
        <div className="p-4 flex items-center gap-3 border-b border-white/5">
          <LogoIcon />
          <span className="text-white font-semibold text-sm flex-1">AgroCloud</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/40 hover:text-white/80 text-lg leading-none">×</button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-auto">
          {soporteNav.map(item => (
            <div key={item.page}>
              {item.section && <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 px-2 pt-4 pb-1.5">{item.section}</p>}
              <button onClick={() => navigate(item.page)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${page === item.page ? "bg-lime-400 text-gray-900" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{item.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
                {item.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">LM</div>
            <div className="min-w-0"><p className="text-white text-xs font-medium truncate">Lucía Méndez</p><p className="text-white/40 text-[10px]">Soporte técnico</p></div>
          </div>
          <div className="flex items-center justify-between px-2 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-lime-400" /><span className="text-[10px] text-white/40">Disponible</span></div>
            <button onClick={onLogout} className="text-[10px] text-white/30 hover:text-white/60">Salir</button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-8 gap-3 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <span className="text-sm text-gray-500 flex-1 truncate">{pageLabels[page]}</span>
          <div className="relative hidden md:block"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input placeholder="Buscar incidencia" className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-lime-400 w-52" /></div>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors relative"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg><span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full" /></button>
          <div className="hidden sm:flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-lime-600 flex items-center justify-center text-white text-xs font-semibold">LM</div><div><p className="text-xs font-medium text-gray-800 leading-none">Lucía Méndez</p><p className="text-[10px] text-gray-400">Soporte</p></div></div>
        </header>
        {page === "dashboard" && <SoporteDashboard setPage={setPage} />}
        {page === "incidencias" && <SoporteIncidencias />}
        {page === "instancias" && <SoporteInstancias />}
        {page === "actividad" && <SoporteActividad />}
        {page === "documentacion" && <SharedDocumentacion />}
        {page === "configuracion" && <SoporteConfiguracion />}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────

function Landing({ onLogin }: { onLogin: () => void }) {
  const DARK = "#0d1a0b";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const features = [
    { icon: "M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", label: "Infraestructura administrada" },
    { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", label: "Bases de datos" },
    { icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9", label: "Acceso desde Internet" },
    { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", label: "Escalabilidad" },
    { icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", label: "Gestión web" },
  ];
  const tplIcons = [
    "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
    "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0",
    "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  ];
  const templates = ["Cultivos y parcelas", "Cosechas y producción", "Inventarios", "Maquinaria", "Proveedores", "Clientes y ventas"];
  const steps = ["Crea tu cuenta", "Selecciona un plan", "Crea tu instancia", "Conecta tu aplicación"];
  const plans = [
    { name: "Finca", storage: "10 GB", instances: "1 instancia de base de datos", price: "Q25", featured: false },
    { name: "Productor", storage: "50 GB", instances: "1 instancia de base de datos", price: "Q60", featured: false },
    { name: "Agro Pro", storage: "100 GB", instances: "1 instancia de base de datos", price: "Q120", featured: false },
    { name: "Agro Ent.", storage: "200 GB", instances: "1 instancia de base de datos", price: "Q250", featured: false },
  ];

  return (
    <div className="min-h-screen bg-white font-[Inter,sans-serif]">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <svg className="w-6 h-6" style={{ color: DARK }} fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
            <span className="font-semibold text-gray-900">AgroCloud</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 flex-1 justify-center">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button key={l} className="hover:text-gray-900 transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button onClick={onLogin} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Iniciar sesión</button>
            <button onClick={onLogin} className="text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors">Comenzar gratis</button>
          </div>
          <div className="md:hidden flex items-center gap-2 ml-auto">
            <button onClick={onLogin} className="text-sm bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-3 py-1.5 rounded-lg transition-colors">Comenzar</button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-6 py-4 flex flex-col gap-3">
            {["Plataforma", "Plantillas", "Planes", "Documentación"].map(l => (
              <button key={l} className="text-sm text-gray-600 hover:text-gray-900 text-left py-1 transition-colors">{l}</button>
            ))}
            <button onClick={onLogin} className="text-sm text-gray-600 hover:text-gray-900 font-medium text-left py-1">Iniciar sesión</button>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: DARK }} className="px-6 pt-20 pb-24 text-center">
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Bases de datos en la nube para el sector agrícola.
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10 max-w-lg mx-auto">
            Crea y administra instancias de PostgreSQL en una infraestructura cloud diseñada para productores, fincas, cooperativas y empresas agroindustriales.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={onLogin} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Crear instancia →
            </button>
            <button className="border border-white/20 hover:border-white/40 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Ver planes
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 bg-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <p className="text-xs font-semibold tracking-widest text-lime-600 uppercase mb-4 flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
            Una nube diseñada para el campo
          </p>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            Tu información agrícola merece una<br />infraestructura confiable
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-2xl mx-auto mb-14">
            AgroCloud proporciona infraestructura de bases de datos administrada en la nube para que productores, fincas, cooperativas y empresas agroindustriales puedan almacenar y centralizar su información sin instalar, configurar o mantener servidores propios.
          </p>
          <div className="flex flex-wrap justify-center gap-10">
            {features.map(f => (
              <div key={f.label} className="flex flex-col items-center gap-3 w-28 text-center">
                <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon.split("M").filter(Boolean).map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={"M" + d} />)}
                  </svg>
                </div>
                <span className="text-xs text-gray-600 leading-snug">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ── */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <div className="max-w-3xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Infraestructura para tus datos agrícolas</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Utiliza tus instancias de AgroCloud para almacenar la información generada por las operaciones de tu organización.
          </p>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
          {templates.map((t, i) => (
            <div key={t} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-lime-300 hover:shadow-sm transition-all cursor-pointer text-center">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {tplIcons[i].split("M").filter(Boolean).map((d, j) => <path key={j} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={"M" + d} />)}
                </svg>
              </div>
              <span className="text-xs text-gray-700 font-medium leading-snug">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mid CTA banner ── */}
      <section className="px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full rounded-2xl px-10 py-10 text-center" style={{ background: DARK }}>
          <h2 className="text-xl font-bold text-white">Administra tus bases de datos desde un solo lugar</h2>
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="px-6 py-20 bg-white text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-14">Tu base de datos lista en pocos pasos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-4 text-center">
                <div className="w-11 h-11 rounded-full bg-lime-400 flex items-center justify-center text-sm font-bold text-gray-900">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span className="text-sm text-gray-700 font-medium leading-snug">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="px-6 py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto mb-12 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Elige el plan que se adapta a ti</h2>
          <p className="text-gray-500 text-sm">Soluciones flexibles para cada etapa de tu negocio agrícola.</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.name} className="rounded-2xl p-6 flex flex-col items-center text-center gap-4" style={{ background: DARK }}>
              <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-semibold text-white text-base">{plan.name}</h3>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
                  <span className="text-xs text-white/50">{plan.storage} Almacenamiento</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <span className="text-xs text-white/50">{plan.instances}</span>
                </div>
              </div>
              <div className="mt-auto w-full">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-white/40">/mes</span>
                </div>
                <button onClick={onLogin} className="w-full py-2 border border-white/20 hover:border-lime-400 hover:bg-lime-400 hover:text-gray-900 text-white text-sm font-medium rounded-lg transition-all">
                  Elegir plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-20 text-center" style={{ background: DARK }}>
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4 leading-snug">
            Lleva la infraestructura de datos de tu organización a la nube
          </h2>
          <p className="text-white/50 text-sm leading-relaxed mb-8">
            Administra tus instancias de Bases de Datos de forma simple, segura y escalable, sin necesidad de mantener servidores propios.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={onLogin} className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Comenzar ahora
            </button>
            <button className="border border-white/20 hover:border-white/40 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors">
              Contactar ventas
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10 w-full text-center">
            {[
              { title: "Producto", links: ["Plataforma", "Características", "Planes", "Soluciones"] },
              { title: "Recursos", links: ["Documentación", "Manual de usuario", "Soporte"] },
              { title: "Empresa", links: ["Nosotros", "Contacto"] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-xs font-semibold text-gray-900 mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><button className="text-sm text-gray-400 hover:text-gray-700 transition-colors">{l}</button></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col items-center gap-3 w-full">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
              <span className="font-semibold text-gray-900 text-sm">AgroCloud</span>
            </div>
            <p className="text-xs text-gray-400">© 2026 AgroCloud. DBaaS para el sector agrícola. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [role, setRole] = useState<Role>("landing");
  if (role === "landing") return <Landing onLogin={() => setRole("login")} />;
  if (role === "login") return <Login onLogin={setRole} />;
  if (role === "admin") return <AdminPanel onLogout={() => setRole("landing")} />;
  if (role === "cliente") return <ClientePanel onLogout={() => setRole("landing")} />;
  return <SoportePanel onLogout={() => setRole("landing")} />;
}
