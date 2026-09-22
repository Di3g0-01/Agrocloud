import { useState } from "react";
import { instances } from "../../data/shared";
import { ProgressBar, StatusBadge } from "../../components/ui";

export function SoporteInstancias({ isDark }: { isDark?: boolean }) {
  const [view, setView] = useState<"grid" | "list">("list");
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex items-start justify-between mb-8">
        <div><h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Instancias</h1><p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Verificación de todas las instancias activas del sistema.</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-lime-400 text-gray-900 font-semibold" : isDark ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-gray-200 text-gray-500"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg></button>
          <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-lime-400 text-gray-900 font-semibold" : isDark ? "bg-slate-900 border border-slate-800 text-slate-400" : "bg-white border border-gray-200 text-gray-500"}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Operativas", count: instances.filter(i => i.estado === "Operativa").length, color: isDark ? "text-lime-400 bg-lime-950/40 border-lime-900/40" : "text-lime-600 bg-lime-50 border-lime-200" },
          { label: "En revisión", count: instances.filter(i => i.estado === "En revisión").length, color: isDark ? "text-amber-400 bg-amber-950/40 border-amber-900/40" : "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Detenidas", count: instances.filter(i => i.estado === "Detenida").length, color: isDark ? "text-red-400 bg-red-950/40 border-red-900/40" : "text-red-600 bg-red-50 border-red-200" }
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}><span className="text-3xl font-semibold">{count}</span><span className="text-sm font-medium">{label}</span></div>
        ))}
      </div>
      {view === "list" ? (
        <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <table className="w-full text-sm"><thead><tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>{["Instancia", "Cliente", "Tipo", "Versión", "Uptime", "CPU", "Memoria", "Región", "Estado"].map(h => <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>)}</tr></thead>
            <tbody>{instances.map(inst => (
              <tr key={inst.nombre} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-mono text-xs font-medium ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-200" : "text-gray-700"}`}>{inst.cliente}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.tipo}</td>
                <td className={`px-5 py-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.version}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-300" : "text-gray-700"}`}>{inst.uptime}</td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.cpu}%</span></div></td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.memoria}%</span></div></td>
                <td className={`px-5 py-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.region}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map(inst => (
            <div key={inst.nombre} className={`border rounded-xl p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}><svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <StatusBadge s={inst.estado} />
              </div>
              <p className={`font-mono text-sm font-semibold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</p>
              <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.cliente}</p>
              <div className="space-y-2">
                <div><div className={`flex justify-between text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}><span>CPU</span><span>{inst.cpu}%</span></div><ProgressBar value={inst.cpu} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
                <div><div className={`flex justify-between text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}><span>Memoria</span><span>{inst.memoria}%</span></div><ProgressBar value={inst.memoria} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
              </div>
              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${isDark ? "border-slate-800 text-slate-400" : "border-gray-100 text-gray-400"}`}><span className="font-mono">{inst.version}</span><span>{inst.region}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
