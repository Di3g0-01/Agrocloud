import { useEffect, useState } from "react";
import { ProgressBar, StatusBadge } from "../../components/ui";
import { getInstancias } from "../../api/instanciasApi";
import type { InstanciaDB } from "../../types";

export function AdminMonitoreo({ isDark }: { isDark?: boolean }) {
  const [instances, setInstances] = useState<InstanciaDB[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const refresh = () => getInstancias().then(setInstances).catch(() => setError("No se pudo actualizar el monitoreo.")).finally(() => setLoading(false));
    refresh();
    const timer = window.setInterval(refresh, 30000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <div className={`flex-1 overflow-auto p-4 lg:p-8 ${isDark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Monitoreo</h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>Estado registrado de todas las instancias, consultado cada 30 segundos.</p>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Operativas", count: instances.filter(i => i.estado === "active").length, color: "text-lime-600 bg-lime-50" },
          { label: "En revisión", count: instances.filter(i => i.estado === "revision").length, color: "text-amber-600 bg-amber-50" },
          { label: "Detenidas", count: instances.filter(i => i.estado === "terminated" || i.estado === "suspended").length, color: "text-red-600 bg-red-50" }
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl border p-5 flex flex-col items-start ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
            <div className="flex items-center gap-2 mb-3"><span className={`w-9 h-9 rounded-lg grid place-items-center font-bold ${color}`}>{label === "Operativas" ? "✓" : label === "En revisión" ? "!" : "×"}</span><span className={`text-[10px] uppercase tracking-wide font-medium ${isDark ? "text-slate-400" : "text-gray-400"}`}>{label}</span></div>
            <span className={`text-3xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{count}</span>
            <span className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-400"}`}>{label === "Operativas" ? "En producción" : label === "En revisión" ? "En mantenimiento" : "Sin servicio"}</span>
          </div>
        ))}
      </div>
      <div className={`border rounded-xl overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-100"}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${isDark ? "border-slate-800 bg-slate-900/60" : "border-gray-100 bg-gray-50"}`}>
              {["Instancia", "Cliente", "CPU", "Memoria", "Uptime", "Estado"].map(h => (
                <th key={h} className={`px-5 py-3 text-left font-medium text-xs uppercase tracking-wide ${isDark ? "text-slate-400" : "text-gray-400"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {instances.map(inst => (
              <tr key={inst.id} className={`border-b transition-colors ${isDark ? "border-slate-800/60 hover:bg-slate-800/40" : "border-gray-50 hover:bg-gray-50"}`}>
                <td className={`px-5 py-4 font-mono text-xs font-medium ${isDark ? "text-lime-400" : "text-gray-900"}`}>{inst.nombre}</td>
                <td className={`px-5 py-4 ${isDark ? "text-slate-300" : "text-gray-600"}`}>{inst.cliente}</td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.cpu ?? 0} color={inst.cpu > 70 ? "bg-red-400" : inst.cpu > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.cpu}%</span></div></td>
                <td className="px-5 py-4 w-36"><div className="flex items-center gap-2"><ProgressBar value={inst.memoria ?? 0} color={inst.memoria > 70 ? "bg-red-400" : inst.memoria > 50 ? "bg-amber-400" : "bg-lime-400"} /><span className={`text-xs w-8 shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.memoria}%</span></div></td>
                <td className={`px-5 py-4 text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>{inst.uptime}</td>
                <td className="px-5 py-4"><StatusBadge s={inst.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-4 text-sm">Cargando instancias...</p>}
      </div>
    </div>
  );
}
