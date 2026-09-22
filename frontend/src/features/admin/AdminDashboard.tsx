import { StatusBadge } from "../../components/ui";
import { templates } from "../../data/shared";

export function AdminDashboard({ onNavigate, isDark }: { onNavigate?: (page: any) => void; isDark?: boolean }) {
  const adminActivity = [
    { dot: "bg-lime-500", title: "Nueva instancia creada", sub: "Cooperativa Occidente" },
    { dot: "bg-blue-400", title: "Nuevo usuario registrado", sub: "Hace 3 horas" },
    { dot: "bg-lime-500", title: "Suscripción renovada", sub: "Finca Los Pinos" },
    { dot: "bg-red-400", title: "Incidencia abierta", sub: "INC-024 · Alta" },
    { dot: "bg-gray-400", title: "Instancia suspendida", sub: "cafe-export-db" },
  ];
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Panel administrativo</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Supervisa la actividad general y el estado operativo de AgroCloud.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "CLIENTES", value: "31", sub: "Organizaciones registradas", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", color: isDark ? "text-blue-400 bg-blue-950/60 border border-blue-800/40" : "text-blue-500 bg-blue-50" },
          { label: "INSTANCIAS", value: "38", sub: "Instancias activas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50" },
          { label: "SUSCRIPCIONES", value: "31", sub: "Suscripciones activas", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", color: isDark ? "text-purple-400 bg-purple-950/60 border border-purple-800/40" : "text-purple-500 bg-purple-50" },
          { label: "INCIDENCIAS", value: "5", sub: "Incidencias abiertas", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", color: isDark ? "text-orange-400 bg-orange-950/60 border border-orange-800/40" : "text-orange-500 bg-orange-50" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 text-left flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-start gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`border rounded-xl overflow-x-auto lg:col-span-2 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            <div>
              <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Instancias recientes</h2>
              <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Vista global de los servicios creados recientemente.</p>
            </div>
            <button onClick={() => onNavigate?.("instancias")} className={`text-sm border px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Ver todas</button>
          </div>
          <table className="w-full min-w-max text-xs">
            <thead>
              <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "border-gray-100 text-gray-400"}`}>
                {["Nombre", "Cliente", "Plantilla", "Plan", "Estado", "Creada"].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-medium uppercase tracking-wide text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
              {[
                { nombre: "agro-produccion-db", cliente: "Finca Los Pinos", plantilla: "Cosechas y producción", plan: "Productor", estado: "Activa", fecha: "28 ago 2026" },
                { nombre: "agro-inventario-db", cliente: "Finca El Roble", plantilla: "Control de inventarios", plan: "Productor", estado: "Activa", fecha: "30 ago 2026" },
                { nombre: "coop-occidente-db", cliente: "Coop. Occidente", plantilla: "Cultivos y parcelas", plan: "Agro Pro", estado: "Activa", fecha: "31 ago 2026" },
              ].map(row => (
                <tr key={row.nombre} className={`transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"}`}>
                  <td className={`px-5 py-4 font-mono font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{row.nombre}</td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{row.cliente}</td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{row.plantilla}</td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{row.plan}</td>
                  <td className="px-5 py-4"><StatusBadge s={row.estado} /></td>
                  <td className={`px-5 py-4 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{row.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`p-5 border-b ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Actividad reciente</h2>
          </div>
          <div className="p-5 space-y-4">
            {adminActivity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.dot}`} />
                <div>
                  <p className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{a.title}</p>
                  <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{a.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
          <div>
            <h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Plantillas de bases de datos</h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Schemas agrícolas disponibles en la plataforma.</p>
          </div>
          <button onClick={() => onNavigate?.("plantillas")} className="bg-lime-400 hover:bg-lime-300 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer">Gestionar plantillas</button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <span key={t} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors cursor-pointer ${isDark ? "border-slate-800 bg-slate-800/40 text-slate-300 hover:border-lime-500/50 hover:bg-lime-950/20" : "border-gray-200 text-gray-700 hover:border-lime-300 hover:bg-lime-50"}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
