import { useState } from "react";
import { CustomSelect, ProgressBar, StatusBadge } from "../../components/ui";
import { INSTANCIAS_ADMIN } from "../../data/admin";
import type { InstanciaAdmin } from "../../types/admin";

export function AdminInstancias({ isDark }: { isDark?: boolean }) {
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
      <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDetalle(null)} className={`flex items-center gap-1.5 text-sm transition-colors cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-gray-500 hover:text-gray-800"}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Instancias
          </button>
          <span className={isDark ? "text-slate-700" : "text-gray-300"}>/</span>
          <span className={`text-sm font-mono ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detalle.nombre}</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}>
            <svg className="w-5 h-5 text-lime-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
          </div>
          <div>
            <h2 className={`font-semibold font-mono ${isDark ? "text-white" : "text-gray-900"}`}>{detalle.nombre}</h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>{detalle.cliente}</p>
          </div>
          <StatusBadge s={detalle.estado} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className={`lg:col-span-2 border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Información general</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                ["Motor", "PostgreSQL"], ["Versión", "PostgreSQL 16"],
                ["Cliente", detalle.cliente], ["Plantilla", detalle.plantilla],
                ["Plan", detalle.plan], ["Almacenamiento", detalle.almacenamiento],
                ["Fecha de creación", detalle.creada], ["Región", "us-east-1"],
              ].map(([k, v]) => (
                <div key={k}><p className={`text-xs mb-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k}</p><p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{v}</p></div>
              ))}
            </div>
          </div>
          <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Estado de recursos</h3>
            <div className="space-y-5">
              {[
                { label: "CPU", value: detalle.cpu, color: detalle.cpu > 70 ? "bg-red-400" : detalle.cpu > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "RAM", value: detalle.ram, color: detalle.ram > 70 ? "bg-red-400" : detalle.ram > 50 ? "bg-amber-400" : "bg-lime-400" },
                { label: "Almacenamiento", value: Math.round(parseInt(detalle.almacenamiento) / parseInt(detalle.almacenamiento.split("/")[1]) * 100), color: "bg-blue-400" },
              ].map(r => (
                <div key={r.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>{r.label}</span>
                    <span className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}>{r.value}%</span>
                  </div>
                  <ProgressBar value={r.value} color={r.color} />
                </div>
              ))}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs ${isDark ? "text-slate-300" : "text-gray-600"}`}>Conexiones activas</span>
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-gray-800"}`}>{detalle.conexiones}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`border rounded-xl p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDark ? "text-slate-200" : "text-gray-800"}`}>Actividad reciente</h3>
          <div className="space-y-3">
            {["Consulta ejecutada correctamente", "Backup automático completado", "Conexión establecida desde 192.168.1.10", "Índice reconstruido en tabla cosechas"].map((a, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-lime-400 mt-1.5 shrink-0" />
                <span className={isDark ? "text-slate-300" : "text-gray-600"}>{a}</span>
                <span className={`ml-auto whitespace-nowrap ${isDark ? "text-slate-500" : "text-gray-400"}`}>hace {i + 1}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Instancias</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión y monitoreo de instancias PostgreSQL de AgroCloud. (Creación reservada únicamente para clientes contratantes)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL", value: "38", sub: "Instancias registradas", color: isDark ? "text-blue-400 bg-blue-950/60 border border-blue-800/40" : "text-blue-500 bg-blue-50", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" },
          { label: "ACTIVAS", value: "34", sub: "En producción", color: isDark ? "text-lime-400 bg-lime-950/60 border border-lime-800/40" : "text-lime-600 bg-lime-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "DETENIDAS", value: "2", sub: "Sin servicio", color: isDark ? "text-red-400 bg-red-950/60 border border-red-800/40" : "text-red-500 bg-red-50", icon: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "MANTENIMIENTO", value: "2", sub: "En revisión técnica", color: isDark ? "text-amber-400 bg-amber-950/60 border border-amber-800/40" : "text-amber-500 bg-amber-50", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3">
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

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar instancia..." className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`} />
        </div>
        <CustomSelect
          value={estadoFilter}
          onChange={(val) => setEstadoFilter(val)}
          options={["Todos", "Activa", "Detenida", "En mantenimiento", "Suspendida"].map((s) => ({ value: s, label: s }))}
        />
      </div>

      <div className={`border rounded-xl overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "bg-slate-800/60 border-slate-800 text-slate-400" : "bg-gray-50 border-gray-100 text-gray-400"}`}>
              {["Instancia", "Cliente", "Plantilla", "Plan", "Almacenamiento", "Estado", "Creada", ""].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-gray-50"}`}>
            {filtered.map(inst => (
              <tr key={inst.id} className={`transition-colors cursor-pointer ${isDark ? "hover:bg-slate-800/40" : "hover:bg-gray-50"}`} onClick={() => setDetalle(inst)}>
                <td className={`px-5 py-4 font-mono text-xs font-medium whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inst.cliente}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.plantilla}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.plan}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.almacenamiento}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.creada}</td>
                <td className="px-5 py-4 relative" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setMenuOpen(menuOpen === inst.id ? null : inst.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === inst.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-40 text-xs ${isDark ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                        {["Ver detalles", "Ver métricas", "Reiniciar", "Detener", "Iniciar", "Suspender", "Eliminar"].map((a, i) => (
                          <button key={a} onClick={() => { setMenuOpen(null); if (a === "Ver detalles") setDetalle(inst); }} className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i >= 5 ? "text-red-500" : ""}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`px-5 py-3 text-xs border-t ${isDark ? "border-slate-800 text-slate-400" : "border-gray-50 text-gray-400"}`}>{filtered.length} instancia{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}
