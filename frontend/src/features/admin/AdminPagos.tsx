import { useState } from "react";
import { CustomSelect } from "../../components/ui";
import { MESES_INGRESOS, PAGOS_ADMIN } from "../../data/admin";

function PagoEstadoBadge({ estado }: { estado: string }) {
  const cls = estado === "Pagado" ? "bg-lime-100 text-lime-700 border border-lime-300"
    : estado === "Pendiente" ? "bg-amber-50 text-amber-700 border border-amber-200"
    : estado === "Rechazado" ? "bg-red-50 text-red-600 border border-red-200"
    : "bg-gray-100 text-gray-500 border border-gray-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{estado}</span>;
}

export function AdminPagos({ isDark }: { isDark?: boolean }) {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("Todos");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const maxMonto = Math.max(...MESES_INGRESOS.map(m => m.monto));
  const filtered = PAGOS_ADMIN.filter(p =>
    (estadoFilter === "Todos" || p.estado === estadoFilter) &&
    (p.cliente.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className={`text-xl lg:text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Pagos</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Gestión de pagos de la plataforma AgroCloud.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "INGRESOS DEL MES", value: "Q2,510", sub: "Septiembre 2026", color: isDark ? "text-lime-400 bg-lime-950/40" : "text-lime-600 bg-lime-50", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS COMPLETADOS", value: "28", sub: "Este mes", color: isDark ? "text-blue-400 bg-blue-950/40" : "text-blue-500 bg-blue-50", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS PENDIENTES", value: "4", sub: "En proceso", color: isDark ? "text-amber-400 bg-amber-950/40" : "text-amber-500 bg-amber-50", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "PAGOS RECHAZADOS", value: "1", sub: "Requieren atención", color: isDark ? "text-red-400 bg-red-950/40" : "text-red-500 bg-red-50", icon: "M6 18L18 6M6 6l12 12" },
        ].map(k => (
          <div key={k.label} className={`border rounded-xl p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.color}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{k.icon.split(" M").map((d, i) => <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={i === 0 ? d : "M" + d} />)}</svg>
              </div>
              <span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.label}</span>
            </div>
            <div className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{k.value}</div>
            <div className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className={`border rounded-xl p-6 mb-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>Ingresos mensuales</h2>
            <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-400"}`}>Últimos 6 meses</p>
          </div>
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-gray-400"}`}>Q (quetzales)</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {MESES_INGRESOS.map(m => (
            <div key={m.mes} className="flex-1 flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-medium ${isDark ? "text-slate-300" : "text-gray-500"}`}>Q{(m.monto / 1000).toFixed(1)}k</span>
              <div className="w-full rounded-t-md bg-lime-400 hover:bg-lime-300 transition-colors cursor-default" style={{ height: `${(m.monto / maxMonto) * 96}px` }} />
              <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-gray-400"}`}>{m.mes}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-slate-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pago..." className={`w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 ${isDark ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500" : "bg-white border-gray-200 text-gray-900"}`} />
        </div>
        <CustomSelect
          value={estadoFilter}
          onChange={(val) => setEstadoFilter(val)}
          options={["Todos", "Pagado", "Pendiente", "Rechazado", "Reembolsado"].map((s) => ({ value: s, label: s }))}
          isDark={isDark}
        />
      </div>

      <div className={`border rounded-xl overflow-x-auto ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>
              {["Transacción", "Cliente", "Concepto", "Monto", "Método", "Fecha", "Estado", ""].map(h => (
                <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-mono text-xs font-semibold ${isDark ? "text-lime-400" : "text-gray-900"}`}>{p.id}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-200" : "text-gray-700"}`}>{p.cliente}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-500"}`}>{p.concepto}</td>
                <td className={`px-5 py-4 text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Q{p.monto}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{p.metodo}</td>
                <td className={`px-5 py-4 text-xs whitespace-nowrap ${isDark ? "text-slate-400" : "text-gray-400"}`}>{p.fecha}</td>
                <td className="px-5 py-4"><PagoEstadoBadge estado={p.estado} /></td>
                <td className="px-5 py-4 relative">
                  <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${isDark ? "hover:bg-slate-800 text-slate-400 hover:text-slate-200" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                  {menuOpen === p.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className={`absolute right-4 top-10 z-20 border rounded-xl shadow-lg py-1 w-44 text-xs ${isDark ? "bg-slate-900 border-slate-700 text-slate-200" : "bg-white border-gray-200 text-gray-700"}`}>
                        {["Ver detalle", "Ver comprobante", "Descargar recibo", "Reembolsar"].map((a, i) => (
                          <button key={a} onClick={() => setMenuOpen(null)} className={`w-full text-left px-4 py-2 transition-colors ${isDark ? "hover:bg-slate-800" : "hover:bg-gray-50"} ${i === 3 ? "text-red-400" : isDark ? "text-slate-200" : "text-gray-700"}`}>{a}</button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`px-5 py-3 text-xs border-t ${isDark ? "text-slate-400 border-slate-800" : "text-gray-400 border-gray-50"}`}>{filtered.length} pago{filtered.length !== 1 ? "s" : ""}</div>
      </div>
    </div>
  );
}
