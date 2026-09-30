import { useState, useEffect } from "react";
import { ProgressBar, StatusBadge } from "../../components/ui";
import { getInstancias } from "../../api/instanciasApi";
import type { InstanciaDB } from "../../types";

export function SoporteInstancias({ isDark }: { isDark?: boolean }) {
  const [view, setView] = useState<"grid" | "list">("list");
  const [instList, setInstList] = useState<InstanciaDB[]>([]);

  useEffect(() => {
    getInstancias().then((data) => {
      if (data && Array.isArray(data)) {
        setInstList(data);
      }
    });
  }, []);

  const operativasCount = instList.filter(i => (i.estado as string) === "active" || (i.estado as string) === "Activa" || (i.estado as string) === "Operativa").length;
  const enRevisionCount = instList.filter(i => (i.estado as string) === "revision" || (i.estado as string) === "En revisión" || (i.estado as string) === "Reiniciando").length;
  const detenidasCount = instList.filter(i => (i.estado as string) === "terminated" || (i.estado as string) === "suspended" || (i.estado as string) === "Detenida").length;

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
          { label: "Operativas", count: operativasCount, color: isDark ? "text-lime-400 bg-lime-950/40 border-lime-900/40" : "text-lime-600 bg-lime-50 border-lime-200" },
          { label: "En revisión", count: enRevisionCount, color: isDark ? "text-amber-400 bg-amber-950/40 border-amber-900/40" : "text-amber-600 bg-amber-50 border-amber-200" },
          { label: "Detenidas", count: detenidasCount, color: isDark ? "text-red-400 bg-red-950/40 border-red-900/40" : "text-red-600 bg-red-50 border-red-200" }
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-4 flex items-center gap-4 ${color}`}><span className="text-3xl font-semibold">{count}</span><span className="text-sm font-medium">{label}</span></div>
        ))}
      </div>

      {instList.length === 0 ? (
        <div className={`border rounded-xl p-12 text-center text-sm ${isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-gray-100 text-gray-500"}`}>
          No hay instancias registradas en el sistema.
        </div>
      ) : view === "list" ? (
        <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
          <table className="w-full text-sm"><thead><tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>{["Instancia", "Cliente", "Tipo", "Versión", "Uptime", "CPU", "Memoria", "Región", "Estado"].map(h => <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>)}</tr></thead>
            <tbody>{instList.map(inst => (
              <tr key={inst.id || inst.nombre} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-mono text-xs font-medium ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-200" : "text-gray-700"}`}>{inst.cliente || "Cliente"}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.tipo || "PostgreSQL 16"}</td>
                <td className={`px-5 py-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.version || "v16.2"}</td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-300" : "text-gray-700"}`}>{inst.uptime || "99.9%"}</td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu || 5} color={(inst.cpu || 5) > 70 ? "bg-red-400" : (inst.cpu || 5) > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.cpu || 5}%</span></div></td>
                <td className="px-5 py-4"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria || 12} color={(inst.memoria || 12) > 70 ? "bg-red-400" : (inst.memoria || 12) > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.memoria || 12}%</span></div></td>
                <td className={`px-5 py-4 text-xs font-mono ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.region || "us-east-1"}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado === "active" ? "Activa" : inst.estado === "revision" ? "Reiniciando" : inst.estado} /></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instList.map(inst => (
            <div key={inst.id || inst.nombre} className={`border rounded-xl p-5 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? "bg-lime-950/40" : "bg-lime-50"}`}><svg className="w-5 h-5 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg></div>
                <StatusBadge s={inst.estado === "active" ? "Activa" : inst.estado === "revision" ? "Reiniciando" : inst.estado} />
              </div>
              <p className={`font-mono text-sm font-semibold mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>{inst.nombre}</p>
              <p className={`text-xs mb-4 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{inst.cliente || "Cliente"}</p>
              <div className="space-y-2">
                <div><div className={`flex justify-between text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}><span>CPU</span><span>{inst.cpu || 5}%</span></div><ProgressBar value={inst.cpu || 5} color={(inst.cpu || 5) > 70 ? "bg-red-400" : (inst.cpu || 5) > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
                <div><div className={`flex justify-between text-xs mb-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}><span>Memoria</span><span>{inst.memoria || 12}%</span></div><ProgressBar value={inst.memoria || 12} color={(inst.memoria || 12) > 70 ? "bg-red-400" : (inst.memoria || 12) > 50 ? "bg-amber-400" : "bg-lime-400"} /></div>
              </div>
              <div className={`mt-4 pt-4 border-t flex items-center justify-between text-xs ${isDark ? "border-slate-800 text-slate-400" : "border-gray-100 text-gray-400"}`}><span className="font-mono">{inst.version || "PostgreSQL 16"}</span><span>{inst.region || "us-east-1"}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
