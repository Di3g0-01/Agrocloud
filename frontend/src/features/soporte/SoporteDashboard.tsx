import type { SoportePage } from "../../types/soporte";
import { incidents, instances } from "../../data/shared";
import { PriorityBadge, StatusBadge } from "../../components/ui";

export function SoporteDashboard({ setPage, isDark }: { setPage: (p: SoportePage) => void; isDark?: boolean }) {
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 lg:mb-8 gap-4">
        <div><h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Panel de soporte</h1><p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestiona incidencias y revisa el estado técnico de las instancias.</p></div>
        <button onClick={() => setPage("incidencias")} className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-gray-900 font-medium px-3 lg:px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="hidden sm:inline">Nueva incidencia</span>
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Incidencias abiertas", value: "12", sub: "Pendientes de atención", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", color: isDark ? "text-blue-400 bg-blue-950/40" : "text-blue-500 bg-blue-50" },
          { label: "En revisión", value: "5", sub: "Atención técnica activa", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: isDark ? "text-orange-400 bg-orange-950/40" : "text-orange-500 bg-orange-50" },
          { label: "Resueltas", value: "28", sub: "Esta semana", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", color: isDark ? "text-lime-400 bg-lime-950/40" : "text-lime-600 bg-lime-50" },
          { label: "Con incidencias", value: "4", sub: "Instancias afectadas", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", color: isDark ? "text-slate-400 bg-slate-800" : "text-gray-500 bg-gray-100" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 text-left flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center justify-start gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className={`text-xs uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className={`lg:col-span-2 border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`p-5 border-b ${isDark ? "border-slate-800" : "border-gray-100"}`}><h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Incidencias recientes</h2><p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Solicitudes que necesitan seguimiento técnico.</p></div>
          <table className="w-full text-xs">
            <thead><tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>{["ID", "Cliente", "Instancia", "Plantilla", "Asunto", "Prior.", "Estado"].map(h => <th key={h} className={`px-5 py-3 text-left font-medium uppercase tracking-wide text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>)}</tr></thead>
            <tbody>{incidents.slice(0, 3).map(inc => (
              <tr key={inc.id} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-medium ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inc.id}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inc.cliente}</td>
                <td className={`px-5 py-4 font-mono text-[10px] ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inc.instancia}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inc.plantilla}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inc.asunto}</td>
                <td className="px-5 py-4"><PriorityBadge p={inc.prioridad} /></td>
                <td className="px-5 py-4"><StatusBadge s={inc.estado} /></td>
              </tr>
            ))}</tbody>
          </table>
          <div className={`px-5 py-3 text-center text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>12 incidencias abiertas · 5 actualmente en revisión</div>
        </div>
        <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
            <div><h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Prioridades</h2><p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Incidencias críticas activas.</p></div>
            <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center">{incidents.filter(i => i.prioridad === "Alta" && i.estado !== "Resuelta").length}</span>
          </div>
          <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
            {incidents.filter(i => i.prioridad === "Alta" && i.estado !== "Resuelta").map(inc => (
              <div key={inc.id} className={`p-4 flex items-start gap-3 transition-colors ${isDark ? "hover:bg-red-950/20" : "hover:bg-red-50/40"}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`font-mono text-xs font-semibold ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inc.id}</span>
                    <StatusBadge s={inc.estado} />
                  </div>
                  <p className={`text-xs truncate ${isDark ? "text-slate-200" : "text-gray-700"}`}>{inc.asunto}</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inc.cliente}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`border rounded-xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? "border-slate-800" : "border-gray-100"}`}>
          <div><h2 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Estado técnico de instancias</h2><p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Contexto operativo para atender las incidencias activas.</p></div>
          <button onClick={() => setPage("instancias")} className="text-xs text-lime-400 hover:text-lime-300 font-medium">Ver instancias →</button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {instances.slice(0, 3).map(inst => (
            <div key={inst.nombre} className={`border rounded-lg p-4 ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-white"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}>
                  <svg className="w-4 h-4 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
                </div>
                <div><p className={`text-xs font-medium font-mono ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</p><p className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.cliente}</p></div>
              </div>
              <StatusBadge s={inst.estado} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
